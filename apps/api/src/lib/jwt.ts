import Elysia from "elysia";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

export interface JWTOption<Name> {
  name?: Name;
  algorithm: jwt.Algorithm;
  publicKey: jwt.PublicKey;
  secretOrPrivateKey: jwt.Secret | jwt.PrivateKey;
}

class JwtService {
  algorithm: jwt.Algorithm;
  publicKey: jwt.PublicKey;
  secretOrPrivateKey: jwt.Secret | jwt.PrivateKey;

  constructor(
    algorithm: jwt.Algorithm,
    publicKey: jwt.PublicKey,
    secretOrPrivateKey: jwt.Secret | jwt.PrivateKey,
  ) {
    this.algorithm = algorithm;
    this.publicKey = publicKey;
    this.secretOrPrivateKey = secretOrPrivateKey;
  }

  async sign(
    payload: string | Buffer | object,
    issuer: string,
    expiresIn: number | StringValue = "1y",
  ) {
    const token = await new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.secretOrPrivateKey,
        {
          algorithm: this.algorithm,
          expiresIn: expiresIn,
          issuer,
        },
        (err, encoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(encoded);
          }
        },
      );
    });

    return token;
  }

  async decode<T>(token: string, issuer: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      jwt.verify(
        token.trim().replace(/^Bearer /, ""),
        this.publicKey,
        {
          algorithms: [this.algorithm],
          issuer,
        },
        (err, encoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(encoded as T);
          }
        },
      );
    });
  }
}

export const jwtPlugin = <const Name extends string = "jwt">({
  name = "jwt" as Name,
  algorithm,
  publicKey,
  secretOrPrivateKey,
}: JWTOption<Name>) => {
  return new Elysia().decorate(
    name as Name extends string ? Name : "jwt",
    new JwtService(algorithm, publicKey, secretOrPrivateKey),
  );
};
