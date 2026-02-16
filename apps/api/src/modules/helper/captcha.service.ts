import { createCanvas } from "@napi-rs/canvas";
import { nanoid } from "nanoid";

import { logger } from "../../lib/logger";
import { redis } from "../../lib/redis";

interface BaseCaptchaOptions {
  // 验证码长度，默认4
  size?: number;
  // 干扰线条的数量，默认1
  noise?: number;
  // 宽度、高度
  width?: number;
  height?: number;

  // 验证码过期时间，默认为 1h
  ttl?: number;

  extra?: any;
}

export interface ImageCaptchaOptions extends BaseCaptchaOptions {
  type?: "number" | "letter" | "mixed";
}

export interface TextCaptchaOptions extends BaseCaptchaOptions {
  size?: number;
  type?: "number" | "letter" | "mixed";
  id?: string;
}

export abstract class CaptchaService {
  static numbers = "0123456789";
  static lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
  static letters = this.lowerCaseLetters + this.lowerCaseLetters.toUpperCase();

  static defaultConfig = {
    default: {
      size: 4,
      noise: 1,
      width: 120,
      height: 40,
      ttl: 3600,
      color: true,
    },
    image: {
      type: "mixed",
    },
    text: {},
    idPrefix: "captcha",
  };

  static randomNumber(min: number, max: number, fixed = 0) {
    return Number((min + Math.random() * (max - min)).toFixed(fixed));
  }

  static async image(options?: ImageCaptchaOptions): Promise<{
    id: string;
    imageBase64: string;
  }> {
    const {
      width,
      height,
      type,
      size,
      noise = 0,
      ttl,
    } = Object.assign(
      {},
      this.defaultConfig,
      this.defaultConfig.default,
      this.defaultConfig.image,
      options,
    );

    const { id, text } = await this.text({
      size,
      type,
      ttl,
    });

    const canvas = createCanvas(width, height);

    const bgColor1 = `rgb(${this.randomNumber(200, 255)},${this.randomNumber(
      200,
      255,
    )},${this.randomNumber(200, 255)})`;
    const bgColor2 = `rgb(${this.randomNumber(200, 255)},${this.randomNumber(
      200,
      255,
    )},${this.randomNumber(200, 255)})`;
    const bgFrom = {
      x: this.randomNumber(0, 0.3, 1),
      y: this.randomNumber(0, 0.3, 1),
    };
    const bgTo = { x: 1 - bgFrom.x, y: 1 - bgFrom.y };

    const context = canvas.getContext("2d");

    const linearGradient = context.createLinearGradient(
      bgFrom.x,
      bgFrom.y,
      bgTo.x,
      bgTo.y,
    );

    linearGradient.addColorStop(0, bgColor1);
    linearGradient.addColorStop(1, bgColor2);
    context.fillStyle = linearGradient;
    context.rect(0, 0, width, height);
    context.fill();

    const itemWidth = width / text.length;
    const fontSizeMax = Math.min(itemWidth, height);
    const fontSizeMin = Math.min(itemWidth * 0.8, height * 0.8);
    // console.log('text---', text);

    for (let index = 0; index < text.length; index++) {
      const textItem = text[index];
      const fontColor = `rgb(${this.randomNumber(1, 150)},${this.randomNumber(
        1,
        150,
      )},${this.randomNumber(1, 150)})`;
      const fontSize = this.randomNumber(fontSizeMin, fontSizeMax);

      const textOption = {
        fill: fontColor,
        text:
          this.randomNumber(0, 1) > 0
            ? textItem!.toLowerCase()
            : textItem!.toUpperCase(),
        fontSize,
        x:
          (index === 0 ? fontSize / 2 : 0) +
          index * itemWidth +
          this.randomNumber(0, itemWidth - fontSize),
        y: this.randomNumber(fontSize, height),
        rotation: this.randomNumber(
          index + 1 === text.length ? 0 : -45,
          index === 0 ? 0 : 45,
        ),
        fontWeight: (this.randomNumber(4, 9) * 100) as any,
        italic: !!this.randomNumber(0, 1),
      };

      // const textNode = new Text(textOption);
      // leafer.add(textNode);

      context.fillStyle = textOption.fill;
      context.font = `${textOption.italic ? "italic" : "normal"} ${
        textOption.fontWeight
      } ${textOption.fontSize}px`;

      context.save();
      context.translate(textOption.x, textOption.y);
      context.rotate((textOption.rotation * Math.PI) / 180);
      context.translate(-textOption.x, -textOption.y);
      context.fillText(textOption.text, textOption.x, textOption.y);
      context.restore();
    }

    // 画噪点
    const noiseCodeSet = "2345678abcdefhijkmnpqrstuvwxyz";
    for (let i = 0; i < 10; i++) {
      const noiseColor = `rgba(${this.randomNumber(
        150,
        225,
      )},${this.randomNumber(150, 225)},${this.randomNumber(
        150,
        225,
      )},${this.randomNumber(0.4, 0.8, 1)})`;
      for (let j = 0; j < 5; j++) {
        const textOption = {
          x: this.randomNumber(-10, width),
          y: this.randomNumber(-10, height),
          text: noiseCodeSet[this.randomNumber(0, noiseCodeSet.length - 1)],
          fill: noiseColor,
          rotation: this.randomNumber(0, 45),
          fontSize: 5,
        };

        // const noiseNode = new Text();
        // leafer.add(noiseNode);

        context.fillStyle = textOption.fill;
        context.font = `${textOption.fontSize}px`;

        context.save();
        context.translate(textOption.x, textOption.y);
        context.rotate(Math.PI / textOption.rotation);
        context.translate(-textOption.x, -textOption.y);
        context.fillText(textOption.text!, textOption.x, textOption.y);
        context.restore();
      }
    }

    // 画干扰线

    for (let index = 0; index < noise; index++) {
      const noiseColor = `rgba(${this.randomNumber(
        150,
        225,
      )},${this.randomNumber(150, 225)},${this.randomNumber(
        150,
        225,
      )},${this.randomNumber(0.4, 0.8, 1)})`;

      const points: Array<{ x: number; y: number }> = [];

      let px = 0,
        py = 0;

      // 曲线前部分
      let A = this.randomNumber(1, height / 2); // 振幅
      let b = this.randomNumber(-(height / 4), height / 4); // Y轴方向偏移量
      let f = this.randomNumber(-(height / 4), height / 4); // X轴方向偏移量
      let T = this.randomNumber(height, width * 2); // 周期
      let w = (2 * Math.PI) / T;

      let px1 = 0; // 曲线横坐标起始位置
      let px2 = this.randomNumber(width / 2, width * 0.8); // 曲线横坐标结束位置

      for (px = px1; px <= px2; px++) {
        if (0 !== w) {
          py = A * Math.sin(w * px + f) + b + height / 2; // y = Asin(ωx+φ) + b
          let i = 5;
          while (i > 0) {
            // imagesetpixel(this->im, (int)(px + i), (int)(py + i), this->color); // 这里(while)循环画像素点比imagettftext和imagestring用字体大小一次画出（不用这while循环）性能要好很多
            points.push({ x: px + i, y: py + 1 });
            i--;
          }
        }
      }

      // 曲线后部分
      A = this.randomNumber(1, height / 2); // 振幅
      f = this.randomNumber(-height / 4, height / 2); // X轴方向偏移量
      T = this.randomNumber(height, width * 2); // 周期
      w = (2 * Math.PI) / T;
      b = py - A * Math.sin(w * px + f) - height / 2;
      px1 = px2;
      px2 = width;

      for (px = px1; px <= px2; px = px + 1) {
        if (0 !== w) {
          py = A * Math.sin(w * px + f) + b + height / 2; // y = Asin(ωx+φ) + b
          let i = 5;
          while (i > 0) {
            points.push({ x: px + i, y: py + 1 });
            i--;
          }
        }
      }

      if (points.length > 0) {
        context.lineWidth = 1;
        context.lineJoin = "round";
        context.strokeStyle = noiseColor;
        context.beginPath();
        context.moveTo(points![0]!.x, points![0]!.y);
        for (const point of points) {
          context.lineTo(point.x, point.y);
        }
        context.stroke();
      }
    }

    const result = await canvas.toDataURLAsync();
    return { id, imageBase64: result };
  }

  static async text(options?: TextCaptchaOptions): Promise<{
    id: string;
    text: string;
  }> {
    const textOptions = Object.assign(
      {},
      this.defaultConfig,
      this.defaultConfig.default,
      this.defaultConfig.text,
      options,
    );
    let chars = "";
    switch (textOptions.type) {
      case "letter":
        chars = this.letters;
        break;
      case "number":
        chars = this.numbers;
        break;
      default:
        chars = this.letters + this.numbers;
        break;
    }
    let text = "";
    while (textOptions.size--) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }
    const id = await this.set(
      { text, extra: textOptions.extra, customId: textOptions.id },
      textOptions.ttl,
    );
    return { id, text };
  }

  static async set(
    data: { text: string; extra?: any; customId?: string },
    ttl: number,
  ): Promise<string> {
    const id = data?.customId ? data?.customId : nanoid();
    const stordId = this.getStoreId(id);
    await redis.set(
      stordId,
      JSON.stringify({
        text: (data?.text || "").toLowerCase(),
        extra: data?.extra,
      }),
    );
    await redis.expire(stordId, ttl);
    return id;
  }

  /**
   * 验证并删除（不论对错）
   * @param id
   * @param value
   * @returns
   */
  static async checkAndRemove(
    id: string,
    value: string,
  ): Promise<false | Record<string, any>> {
    if (!id || !value) {
      return false;
    }
    const storeId = this.getStoreId(id);
    const storedValueStr = await redis.get(storeId);
    if (!storedValueStr) return false;
    try {
      await redis.del(storeId);
      const storedValue = JSON.parse(storedValueStr);
      logger.debug(`storedValue: ${JSON.stringify(storedValue)}`);
      if (
        !storedValue?.text ||
        value.toLowerCase() !== storedValue?.text?.toLowerCase?.()
      ) {
        return false;
      }
      return storedValue.extra;
    } catch (error) {
      logger.error("验证码验证并删除失败", error);
      return false;
    }
  }

  /**
   * 验证 （有限次数）
   * @param id
   * @param value
   * @param maxTime 次数
   * @returns
   */
  static async checkLimitCount(
    id: string,
    value: string,
    maxTime = 6,
  ): Promise<false | Record<string, any>> {
    if (!id || !value) return false;
    const storeId = this.getStoreId(id);
    const storedValueStr = await redis.get(storeId);
    if (!storedValueStr) return false;

    const ttl = await redis.ttl(storeId);

    const timeKey = `${storeId}.time`;
    // 尝试次数
    const time = await redis.incr(timeKey);

    // 设置过期时间
    await redis.expire(timeKey, ttl + 5);

    if (time > maxTime) {
      await redis.del(storeId);
      await redis.del(timeKey);
      return false;
    }

    try {
      const storedValue = JSON.parse(storedValueStr);
      logger.debug(`storedValue: ${JSON.stringify(storedValue)}`);
      if (
        !storedValue?.text ||
        value.toLowerCase() !== storedValue?.text?.toLowerCase?.()
      ) {
        return false;
      }
      await redis.del(storeId);
      await redis.del(timeKey);
      return storedValue.extra;
    } catch (error) {
      logger.error("验证码验证次数失败", error);
      return false;
    }
  }

  static async remove(id: string) {
    const storeId = this.getStoreId(id);
    redis.del(storeId);
  }

  private static getStoreId(id: string): string {
    if (!this.defaultConfig.idPrefix) {
      return id;
    }
    return `:${this.defaultConfig.idPrefix}:${id}`;
  }
}
