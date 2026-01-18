export function newMessages() {
  return {
    default: "%s 验证错误",
    required: "%s 是必填项",
    enum: "%s 必须是 %s 其中一个",
    whitespace: "%s 不能为空",
    date: {
      format: "%s 日期 %s 对于格式 %s 无效",
      parse: "无法解析 %s 日期, %s 是无效的 ",
      invalid: "%s 日期 %s 是无效的",
    },
    types: {
      string: "%s 不是字符",
      method: "%s 不是函数",
      array: "%s 不是数组",
      object: "%s 不是对象",
      number: "%s 不是数字",
      date: "%s 不是日期",
      boolean: "%s 不是真假",
      integer: "%s 不是整数",
      float: "%s 不是小数",
      regexp: "%s 不是正则表达式",
      email: "%s 不是邮箱格式",
      url: "%s 不是链接格式",
      hex: "%s 不是有效的16进制格式",
    },
    string: {
      len: "%s 必须正好是 %s 个字符",
      min: "%s 必须至少有 %s 个字符",
      max: "%s 不能超过 %s 个字符",
      range: "%s 必须介于 %s 与 %s 个字符之间",
    },
    number: {
      len: "%s 必须等于 %s",
      min: "%s 不能小于 %s",
      max: "%s 不能大于 %s",
      range: "%s 必须在 %s 和 %s 之间",
    },
    array: {
      len: "%s 的数量必须正好是 %s",
      min: "%s 的数量不能小于 %s",
      max: "%s 的数量不能大于 %s",
      range: "%s 的数量必须在 %s 和 %s 之间",
    },
    pattern: {
      mismatch: "%s 值 %s 与模式 %s 不匹配",
    },
    clone() {
      const cloned = JSON.parse(JSON.stringify(this));
      cloned.clone = this.clone;
      return cloned;
    },
  };
}

export const messages = newMessages();

const formatRegExp = /%[sdj%]/g;

export function formatMessage(
  template: ((...args: any[]) => string) | string,
  ...args: any[]
): string {
  let i = 0;
  const len = args.length;
  if (typeof template === "function") {
    return template.apply(null, args);
  }
  if (typeof template === "string") {
    let str = template.replace(formatRegExp, (x) => {
      if (x === "%%") {
        return "%";
      }
      if (i >= len) {
        return x;
      }
      switch (x) {
        case "%s":
          return String(args[i++]);
        case "%d":
          return Number(args[i++]) as unknown as string;
        case "%j":
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return "[Circular]";
          }
          break;
        default:
          return x;
      }
    });
    return str;
  }
  return template;
}
