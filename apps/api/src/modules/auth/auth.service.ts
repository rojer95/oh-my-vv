import {
  BusinessErrorCode,
  PASSWORD_PATTERN,
  PERMISSIONS,
  RoleDataPermType,
} from "@rojer/mf-common";
import * as bcrypt from "bcryptjs";
import { isArray, uniq } from "lodash-es";
import { FindOperator, In } from "typeorm";
import { AuthValidateResult } from "../../lib/auth";
import { BusinessError } from "../../lib/error";
import { logger } from "../../lib/logger";
import { redis } from "../../lib/redis";
import { AppDataSource } from "../../lib/typeorm";
import { CaptchaService } from "../helper/captcha.service";
import { TotpService } from "../helper/totp.service";
import { MailService } from "../mail/mail.service";
import { SystemAccount } from "../system-account/system-account.entity";
import { SystemAccountService } from "../system-account/system-account.service";
import { SystemConfigService } from "../system-config/system-config.service";
import { SystemDepartmentService } from "../system-department/system-department.service";
import { SystemRole } from "../system-role/system-role.entity";

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
   * 根据用户获取用户全部角色
   * @param user
   * @returns
   */
  static async getRolesByUser(user: SystemAccount) {
    return await AppDataSource.getRepository(SystemRole).find({
      where: {
        id: In(user.role || []),
        active: true,
      },
    });
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

    const roles = await this.getRolesByUser(user);

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
   * 根据角色输出部门范围id与用户范围id，undefined 代表不限制范围
   * @param matchRoles
   * @param user
   * @returns
   */
  static async getDataRangeConditionByMatchRoles(
    matchRoles: Array<SystemRole>,
    user: SystemAccount,
  ): Promise<{
    dataDeptIds: FindOperator<number> | undefined;
    dataUserIds: FindOperator<number> | undefined;
  }> {
    let dataDeptIds: Array<number> | undefined = undefined;
    let dataUserIds: Array<number> | undefined = undefined;

    const departmentIds = await SystemDepartmentService.findSelfAndChildTreeIds(
      {
        id: user.departmentId,
        tenantId: user.tenantId,
      },
    );

    if (matchRoles.every((r) => r.dataPermType !== RoleDataPermType.all)) {
      for (const matchRole of matchRoles) {
        // 用户所在部门
        if (matchRole.dataPermType === RoleDataPermType.department) {
          if (!dataDeptIds) dataDeptIds = [];
          dataDeptIds.push(user.departmentId);
        }

        // 用户所在及以下部门
        if (matchRole.dataPermType === RoleDataPermType.departments) {
          if (!dataDeptIds) dataDeptIds = [];
          dataDeptIds.push(...departmentIds);
        }

        // 自定义部门
        if (matchRole.dataPermType === RoleDataPermType.custom) {
          if (!dataDeptIds) dataDeptIds = [];
          dataDeptIds.push(...(matchRole.department || []));
        }

        // 仅用户本人数据
        if (matchRole.dataPermType === RoleDataPermType.user) {
          if (!dataUserIds) dataUserIds = [];
          dataUserIds.push(user.id);
        }
      }
    }

    return {
      dataDeptIds: dataDeptIds ? In(uniq(dataDeptIds)) : undefined,
      dataUserIds: dataUserIds ? In(uniq(dataUserIds)) : undefined,
    };
  }

  /**
   * 验证用户是否具有以下任意一个权限，并输出数据权限范围
   * @param user
   * @param permissionKeys
   * @returns
   */
  static async hasAnyPermi(
    user: SystemAccount,
    permissionKeys: string[],
  ): Promise<AuthValidateResult> {
    if (user.isSuper) {
      return { pass: true, isSuper: true };
    }

    const roles = await this.getRolesByUser(user);
    const matchRoles: Array<SystemRole> = [];

    for (const role of roles) {
      if (!isArray(role.menuPerm) || role.menuPerm.length === 0) continue;
      for (const permissionKey of permissionKeys) {
        if (role.menuPerm.includes(permissionKey)) {
          matchRoles.push(role);
          break;
        }
      }
    }

    const { dataDeptIds, dataUserIds } =
      await this.getDataRangeConditionByMatchRoles(matchRoles, user);

    return {
      pass: matchRoles.length > 0,
      isSuper: false,
      dataDeptIds,
      dataUserIds,
    };
  }

  /**
   * 验证用户是否不具备某权限，并输出数据权限范围（与 hasPermi逻辑相反）
   * @param user
   * @param permissionKey
   */
  static async lacksPermi(
    user: SystemAccount,
    permissionKey: string,
  ): Promise<AuthValidateResult> {
    if (user.isSuper) {
      return { pass: true, isSuper: true };
    }

    const roles = await this.getRolesByUser(user);
    const matchRoles: Array<SystemRole> = [];

    for (const role of roles) {
      if (!isArray(role.menuPerm) || role.menuPerm.length === 0) continue;
      if (!role.menuPerm.includes(permissionKey)) {
        matchRoles.push(role);
      }
    }

    const { dataDeptIds, dataUserIds } =
      await this.getDataRangeConditionByMatchRoles(matchRoles, user);

    return {
      pass: matchRoles.length > 0,
      isSuper: false,
      dataDeptIds,
      dataUserIds,
    };
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

    await MailService.send(
      admin.mail,
      "找回您的密码",
      `您的验证码为：${text} （五分钟有效）`,
    );
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

    await MailService.send(mail, title, `您的验证码为：${text} （五分钟有效）`);
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
