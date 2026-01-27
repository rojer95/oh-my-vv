import {
  BusinessErrorCode,
  PASSWORD_PATTERN,
  PERMISSIONS,
} from "@rojer/mf-common";
import * as bcrypt from "bcryptjs";
import { isArray } from "lodash-es";
import { In } from "typeorm";
import { BusinessError } from "../../lib/error";
import { logger } from "../../lib/logger";
import { redis } from "../../lib/redis";
import { AppDataSource } from "../../lib/typeorm";
import { mailQueue } from "../../queue/mail.queue";
import { CaptchaService } from "../helper/captcha.service";
import { TotpService } from "../helper/totp.service";
import { SystemAccount } from "../system-account/system-account.entity";
import { SystemConfigService } from "../system-config/system-config.service";
import { SystemRole } from "../system-role/system-role.entity";
import { SystemAccountService } from "../system-account/system-account.service";

export abstract class AuthService {
  static salt = 10;
  static ttl = 15; // 15分钟
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
    const ttl = await SystemConfigService.getValueByKey<number>(
      "sys:login:ttl",
      "number",
      this.ttl,
    );

    const failKey = this.getFailKey(key);
    await redis.incrby(failKey, 1);

    await redis.expire(failKey, ttl * 60);
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

    const maxFailCount = await SystemConfigService.getValueByKey<number>(
      "sys:login:maxFailCount",
      "number",
      this.maxFailCount,
    );

    if (failCount > maxFailCount) {
      const ttl = await this.getFailTtl(key);
      throw new BusinessError(BusinessErrorCode.TryLater, {
        t: `${ttl}分钟`,
      });
    }

    return failCount;
  }

  /**
   * 获取验证码状态
   * @param ip
   * @returns
   */
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

  /**
   * 根据用户获取用户全部权限
   * @param user
   * @returns
   */
  static async getPermissionsByUser(user: SystemAccount) {
    const AllPermissionByAccountType = Object.values(PERMISSIONS).filter(
      (permission) => {
        if (!isArray(permission.accountType)) return true;
        return permission.accountType.includes(user.accountType);
      },
    );

    if (user.isSuper) return AllPermissionByAccountType.map((i) => i.key);

    const roles = await AppDataSource.getRepository(SystemRole).find({
      where: {
        id: In(user.role),
        active: true,
      },
    });

    const allPermissions = new Set<string>();

    for (const permission of AllPermissionByAccountType) {
      if (
        (roles || []).some((role) =>
          (role.menuPerm || []).includes(permission.key),
        )
      ) {
        allPermissions.add(permission.key);
      }
    }

    return Array.from(allPermissions);
  }

  /**
   * 验证用户是否具备某权限
   * @param user
   * @param permissionKey
   * @returns
   */
  static async hasPermi(
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
   * 验证用户是否不具备某权限，与 hasPermi逻辑相反
   * @param user
   * @param permissionKey
   */
  static async lacksPermi(user: SystemAccount, permissionKey: string) {
    return !(await this.hasPermi(user, permissionKey));
  }

  /**
   * 验证用户是否具有以下任意一个权限
   * @param user
   * @param permissionKeys
   * @returns
   */
  static async hasAnyPermi(user: SystemAccount, permissionKeys: string[]) {
    if (user.isSuper) {
      return true;
    }
    const allPermissions = await this.getPermissionsByUser(user);
    return permissionKeys.some((permissionKey) =>
      allPermissions.includes(permissionKey),
    );
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

    const maxFailCount = await SystemConfigService.getValueByKey<number>(
      "sys:login:maxFailCount",
      "number",
      this.maxFailCount,
    );

    if (
      !systemAccount ||
      !this.checkPassword(password, systemAccount.password)
    ) {
      await this.failOnce(ip);
      throw new BusinessError(BusinessErrorCode.LoginFail, {
        t: maxFailCount - failCount,
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
          t: maxFailCount - failCount,
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

  static async sendCodeToMail(accountId: number, mail: string, title: string) {
    const { text } = await CaptchaService.text({
      ttl: 300,
      type: "number",
      id: `admin-bind.${mail}`,
      extra: {
        accountId,
      },
    });

    await mailQueue.add("send", {
      data: {
        to: mail,
        subject: title,
        text: `您的验证码为：${text} （五分钟有效）`,
      },
    });
  }

  /**
   * 修改邮箱
   * @param checkMail
   * @param code
   * @param changedMail
   */
  static async checkCodeAndChangeMail(
    accountId: number,
    checkMail: string,
    code: string,
    changedMail: string,
  ) {
    const checkPass = await CaptchaService.checkLimitCount(
      `admin-bind.${checkMail}`,
      code,
    );

    if (checkPass === false) {
      throw new BusinessError(BusinessErrorCode.CaptchaCodeError);
    }

    await AppDataSource.getRepository(SystemAccount)
      .createQueryBuilder()
      .update()
      .set({ mail: changedMail })
      .where({ id: accountId })
      .execute();
  }

  static getAccountIdCheckKey(accountId: number) {
    return `auid:${accountId}`;
  }

  static async resetPassword(accountId: number, newPassword: string) {
    await AppDataSource.getRepository(SystemAccount)
      .createQueryBuilder()
      .update()
      .set({ password: this.hashPassword(newPassword) })
      .where({ id: accountId })
      .execute();
  }

  /**
   * 生成多重认证
   * @returns
   */
  static async generateTotp() {
    return TotpService.generate();
  }

  /**
   * 绑定多重认证
   * @param id
   * @returns
   */
  static async bindTotp(id: number, totpSecret: string, code: string) {
    const target = await SystemAccountService.findOneWithSecretBy({
      id,
    });

    if (target.totpSecret) {
      throw new BusinessError(BusinessErrorCode.TotpAlreadyBind);
    }

    const pass = TotpService.validate(totpSecret, code);
    if (!pass) throw new BusinessError(BusinessErrorCode.TotpTokenIncorrect);

    await AppDataSource.getRepository(SystemAccount)
      .createQueryBuilder()
      .update()
      .set({ totpSecret })
      .where({ id })
      .execute();
  }

  /**
   * 绑定多重解除绑定
   * @param id
   * @returns
   */
  static async unbindTotp(id: number, code: string) {
    const target = await SystemAccountService.findOneWithSecretBy({
      id,
    });

    if (!target.totpSecret) {
      throw new BusinessError(BusinessErrorCode.TotpNotBind);
    }

    const pass = TotpService.validate(target.totpSecret, code);
    if (!pass) throw new BusinessError(BusinessErrorCode.TotpTokenIncorrect);

    await AppDataSource.getRepository(SystemAccount)
      .createQueryBuilder()
      .update()
      .set({ totpSecret: "" })
      .where({ id })
      .execute();
  }
}
