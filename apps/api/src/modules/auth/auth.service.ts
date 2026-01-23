import {
  BusinessErrorCode,
  PASSWORD_PATTERN,
  PERMISSIONS,
} from "@rojer/mf-common";
import * as bcrypt from "bcryptjs";
import { In } from "typeorm";
import { SystemAccount } from "../system-account/system-account.entity";
import { SystemRole } from "../system-role/system-role.entity";
import { BusinessError } from "../../lib/error";
import { logger } from "../../lib/logger";
import { redis } from "../../lib/redis";
import { AppDataSource } from "../../lib/typeorm";
import { mailQueue } from "../../queue/mail.queue";
import { CaptchaService } from "../helper/captcha.service";
import { TotpService } from "../helper/totp.service";

export abstract class AuthService {
  static salt = 10;
  static ttl = 15 * 60; // 15分钟
  static maxFailCount = 3; // 最多尝试次数

  /**
   * 验证密码
   * @param password 密码
   * @param hasdedPassword 加密后的密码
   * @returns
   */
  static checkPassword(password: string, hasdedPassword: string) {
    return bcrypt.compareSync(password, hasdedPassword);
  }

  /**
   * 密码hash加密
   * @param password
   * @returns hash的密码
   */
  static hashPassword(password: string) {
    const isLocal = process.env.NODE_ENV === "local";
    if (!isLocal) {
      if (password.length < 8 || !PASSWORD_PATTERN.test(password)) {
        throw new BusinessError(BusinessErrorCode.PasswordTooSimple);
      }
    }
    return bcrypt.hashSync(password, bcrypt.genSaltSync(this.salt));
  }

  /**
   * 获取错误次数key
   * @param ip
   * @returns
   */
  static getFailKey(ip: string) {
    return `:auth:fail:${ip}`;
  }

  /**
   * 错误一次
   * @param ip
   */
  static async failOnce(key: string) {
    const failKey = this.getFailKey(key);
    await redis.incrby(failKey, 1);
    await redis.expire(failKey, this.ttl);
  }

  /**
   * 移除错误次数
   * @param ip
   */
  static async failRemove(key: string) {
    const failKey = this.getFailKey(key);
    await redis.del(failKey);
  }

  /**
   * 获取缓存剩余时间
   * @param ip
   * @returns
   */
  static async getFailTtl(key: string) {
    const failKey = this.getFailKey(key);
    const ttl = await redis.ttl(failKey);
    return Math.floor(ttl / 60);
  }

  /**
   * 检测并获取错误次数
   * @param ip
   * @returns
   */
  static async getAndCheckFailCount(key: string) {
    const failKey = this.getFailKey(key);
    const failCount = Number((await redis.get(failKey)) || 0);

    logger.debug(`key: ${key} failCount: ${failCount}`);

    if (failCount > this.maxFailCount) {
      const ttl = await this.getFailTtl(key);
      throw new BusinessError(BusinessErrorCode.TryLater, {
        t: `${ttl}分钟`,
      });
    }

    return failCount;
  }

  static async getCaptchaStatus(ip: string) {
    try {
      const count = await this.getAndCheckFailCount(ip);
      return { status: count > 0 };
    } catch (error) {
      return { status: true };
    }
  }

  /**
   * 获取是否启用totp
   * @param account
   * @returns
   */
  static async getTotpStatusByAccount(account: string) {
    const target = await AppDataSource.getRepository(SystemAccount).findOne({
      where: {
        account,
      },
      select: ["totpSecret"],
    });

    return { status: target && target.totpSecret ? true : false };
  }

  static async getPermissionsByUser(user: SystemAccount) {
    if (user.isSuper) return Object.values(PERMISSIONS).map((i) => i.key);

    const roles = await AppDataSource.getRepository(SystemRole).find({
      where: {
        id: In(user.role),
        active: true,
      },
    });

    const allPermissions = new Set<string>();

    for (const role of roles) {
      (role.menuPerm || []).forEach((p: string) => allPermissions.add(p));
    }

    return Array.from(allPermissions);
  }

  static async checkPermission(
    user: SystemAccount,
    permissionKey: string,
  ): Promise<boolean> {
    if (user.isSuper) {
      return true;
    }
    const allPermissions = await this.getPermissionsByUser(user);
    return allPermissions.includes(permissionKey);
  }

  /**
   * 登录
   * @param account
   * @param password
   * @param ip
   * @param id
   * @param code
   * @param totpToken
   * @returns
   */
  static async login(
    account: string,
    password: string,
    ip: string,
    codeId?: string,
    code?: string,
    totpToken?: string,
  ) {
    const failCount = await this.getAndCheckFailCount(ip);

    if (failCount > 0) {
      if (!codeId || !code)
        throw new BusinessError(BusinessErrorCode.LackCaptchaCode);

      // 验证验证码
      const codePass = await CaptchaService.checkAndRemove(codeId, code);

      if (codePass === false) {
        await this.failOnce(ip);
        throw new BusinessError(BusinessErrorCode.CaptchaCodeError);
      }
    }

    const systemAccount = await AppDataSource.getRepository(
      SystemAccount,
    ).findOne({
      where: { account },
      select: [
        "id",
        "accountType",
        "account",
        "password",
        "active",
        "loginCount",
        "totpSecret",
      ],
    });

    if (
      !systemAccount ||
      !this.checkPassword(password, systemAccount.password)
    ) {
      await this.failOnce(ip);
      throw new BusinessError(BusinessErrorCode.LoginFail, {
        t: this.maxFailCount - failCount,
      });
    }

    if (!systemAccount.active) {
      throw new BusinessError(BusinessErrorCode.AccountBan);
    }

    if (systemAccount.totpSecret) {
      if (!totpToken) {
        await this.failOnce(ip);
        throw new BusinessError(BusinessErrorCode.LackTotp);
      }

      if (!TotpService.validate(systemAccount.totpSecret, totpToken)) {
        await this.failOnce(ip);
        throw new BusinessError(BusinessErrorCode.TotpTokenError, {
          t: this.maxFailCount - failCount,
        });
      }
    }

    // 记录最后登录ip与时间
    await AppDataSource.getRepository(SystemAccount)
      .createQueryBuilder()
      .update()
      .set({
        lastIp: ip,
        lastTime: new Date(),
        loginCount: () => "loginCount + 1",
      })
      .where({ id: systemAccount.id })
      .execute();

    await this.failRemove(ip);
    return systemAccount;
  }

  /**
   * 发送找回密码验证码
   * @param account
   * @returns
   */
  static async sendForgetCode(account: string) {
    const admin = await AppDataSource.getRepository(SystemAccount).findOne({
      where: {
        account,
      },
      select: ["id", "mail"],
    });

    if (!admin || !admin.mail) {
      throw new BusinessError(BusinessErrorCode.AccountNotBindMain);
    }

    const { text } = await CaptchaService.text({
      ttl: 300,
      type: "number",
      id: `admin-forget.${admin.mail}`,
    });

    await mailQueue.add("send", {
      data: {
        to: admin.mail,
        subject: "找回您的密码",
        text: `您的验证码为：${text} （五分钟有效）`,
      },
    });
  }

  /**
   * 忘记密码-重置密码
   * @param account
   * @param id
   * @param code
   * @param password
   */
  static async forgetResetPassword(
    account: string,
    code: string,
    password: string,
  ) {
    const admin = await AppDataSource.getRepository(SystemAccount).findOne({
      where: {
        account,
      },
      select: ["id", "mail"],
    });

    if (!admin || !admin.mail) {
      throw new BusinessError(BusinessErrorCode.AccountNotBindMain);
    }

    const pass = await CaptchaService.checkLimitCount(
      `admin-forget.${admin.mail}`,
      code,
    );

    if (pass === false) {
      throw new BusinessError(BusinessErrorCode.CaptchaCodeError);
    }

    await AppDataSource.getRepository(SystemAccount)
      .createQueryBuilder()
      .update()
      .set({ password: this.hashPassword(password) })
      .where({ id: admin.id })
      .execute();
  }
}
