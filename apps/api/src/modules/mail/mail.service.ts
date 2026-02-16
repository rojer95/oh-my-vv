import { BusinessErrorCode } from "@rojer/mf-common";
import nodemailwer from "nodemailer";
import z from "zod";
import { BusinessError } from "../../lib/error";
import { SystemConfigService } from "../system-config/system-config.service";
import { mailQueue } from "./mai.queue";

export abstract class MailService {
  static async getConfig() {
    const smtpConfigData =
      await SystemConfigService.getValueByKeyPrefix("smtp");

    const { success, data } = z
      .object({
        host: z.string(),
        port: z.preprocess((val) => {
          if (typeof val === "string") {
            return Number.parseInt(val);
          }
          return val;
        }, z.int()),
        ssl: z.preprocess((val) => {
          return val === "1";
        }, z.boolean()),
        user: z.string(),
        pass: z.string(),
      })
      .safeParse(smtpConfigData);

    if (success) return data;
    throw new BusinessError(BusinessErrorCode.SystemConfigSmtpError);
  }

  static async send(to: string, subject: string, text: string, html?: string) {
    await this.getConfig();
    await mailQueue.add("send", {
      to,
      subject,
      text,
      html,
    });
  }

  static async processSend(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    const config = await this.getConfig();

    const transport = nodemailwer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.ssl,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transport.sendMail({
      from: `${config.user?.split?.("@")?.[0] || ""}<${config.user}>`,
      to,
      subject,
      text,
      html,
    });
  }
}
