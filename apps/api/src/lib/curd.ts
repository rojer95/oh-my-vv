import Elysia from "elysia";
import { isArray, isNil } from "lodash-es";
import {
  Between,
  FindManyOptions,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from "typeorm";
import z from "zod";

type Option = {
  tenantId?: boolean | string;
  defaultSort?: Record<string, "DESC" | "ASC">;
};

export interface CurdFindManyOptions<
  Entity = any,
> extends FindManyOptions<Entity> {
  where: FindOptionsWhere<Entity>;
  select?: FindOptionsSelect<Entity>;
}

const JoiItem = z.object({
  key: z.string().trim().min(1),
  value: z.any(),
  op: z
    .enum([
      "=",
      ">",
      ">=",
      "<",
      "<=",
      "<>",
      "in",
      "notIn",
      "between",
      "notBetween",
      "like",
    ])
    .optional()
    .default("="),
});

const getSchema = (key: string) => {
  return z.object({ [key]: z.array(JoiItem).optional().default([]) });
};

const getData = (method: string = "POST", req: { query: any; body: any }) => {
  if (method === "POST") return req.body ?? {};
  if (method === "GET") return req.query ?? {};
  return {};
};

const getWhereItem = (item: any) => {
  switch (item.op) {
    case ">":
      return MoreThan(item.value);
    case ">=":
      return MoreThanOrEqual(item.value);
    case "<":
      return LessThan(item.value);
    case "<=":
      return LessThanOrEqual(item.value);
    case "<>":
      return Not(item.value);
    case "like":
      return Like(item.value);
    case "in":
      return In(item.value);
    case "notIn":
      return Not(In(item.value));
    case "between":
      return Between(item.value?.[0], item.value?.[1]);
    case "notBetween":
      return Not(Between(item.value?.[0], item.value?.[1]));
    default:
      return item.value;
  }
};

/**
 * 从请求获取where条件
 * @param withMciId
 * @returns
 */
const getWhere = (
  option: Option,
  data: any,
  tenantId?: number,
): Record<string, any> => {
  const where: FindOptionsWhere<any> = {};

  const parseResult = getSchema("where").safeParse(data);
  if (!parseResult.success) throw parseResult.error;

  if (isArray(parseResult?.data?.where)) {
    for (const item of parseResult?.data?.where) {
      where[item.key] = getWhereItem(item);
    }
  }

  if (option?.tenantId) {
    where[option.tenantId === true ? "tenantId" : option.tenantId] = isNil(
      tenantId,
    )
      ? -1
      : tenantId;
  }

  return where;
};

/**
 * 从请求中获取排序
 * @returns
 */
const getOrder = (data: any, option?: Option) => {
  const parseResult = z
    .record(
      z.string(),
      z.enum(["ASC", "asc", "DESC", "desc"]).transform((v) => v.toUpperCase()),
    )
    .safeParse(data?.order || {});
  if (!parseResult.success) throw parseResult.error;
  let order = parseResult.data;
  if (Object.keys(order).length === 0 && option?.defaultSort) {
    return option.defaultSort;
  }
  return order;
};

/**
 * 从请求获取分页skip
 * @returns
 */
const getSkip = (data: any): number => {
  const limit = getTake(data);
  return (Number(data?.page || 1) - 1) * limit;
};

/**
 * 从请求中获取分页take
 * @returns
 */
const getTake = (data: any): number => {
  return Number(data?.pageSize || 20);
};

/**
 * 从请求中获取分页
 * @returns
 */
const getPager = (data: any) => {
  if (isFinite(Number(data?.page))) {
    return {
      take: getTake(data),
      skip: getSkip(data),
    };
  }
  return {};
};

export const curdPlugin = new Elysia({ name: "lib_curd" })
  .resolve({ as: "scoped" }, ({ body }) => ({
    tenantId: 0, // 系统预留
    bodyWithTenantId: {
      ...(body || {}),
      tenantId: 0,
    },
  }))
  .macro("findManyOption", (option?: Option | true) => ({
    resolve: ({ query, body, request, tenantId }) => {
      if (option === true || option === undefined) {
        option = {
          tenantId: "tenantId",
        };
      }
      const data = getData(request.method, { query, body });
      const options: CurdFindManyOptions = {
        where: getWhere(option, data, tenantId),
        order: getOrder(data, option),
        ...getPager(data),
      };
      return {
        findManyOption: options,
      };
    },
  }));
