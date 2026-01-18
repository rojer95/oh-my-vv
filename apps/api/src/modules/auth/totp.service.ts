import * as speakeasy from "speakeasy";

export abstract class TotpService {
  static generate() {
    return speakeasy.generateSecret({
      name: process.env.APP_NAME,
    });
  }

  static validate(base32: string, token: string) {
    return speakeasy.totp.verify({
      secret: base32,
      encoding: "base32",
      token,
      window: 6,
    });
  }
}
