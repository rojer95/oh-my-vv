/// <reference lib="dom" />
import type { Elysia, ELYSIA_FORM_DATA } from "elysia";

import type { EdenFetchError } from "@elysiajs/eden";
import type { EdenWS } from "@elysiajs/eden/treaty";
import type { BunFile } from "bun";

// https://stackoverflow.com/a/39495173
type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type ErrorRange = Range<300, 599>;

export type MapError<T extends Record<number, unknown>> = [
  {
    [K in keyof T]-?: K extends ErrorRange ? K : never;
  }[keyof T],
] extends [infer A extends number]
  ? {
      [K in A]: EdenFetchError<K, T[K]>;
    }[A]
  : false;

export type UnionToIntersect<U> = (
  U extends any ? (arg: U) => any : never
) extends (arg: infer I) => void
  ? I
  : never;

export type UnionToTuple<T> =
  UnionToIntersect<T extends any ? (t: T) => T : never> extends (
    _: any,
  ) => infer W
    ? [...UnionToTuple<Exclude<T, W>>, W]
    : [];

export type IsAny<T> = 0 extends 1 & T ? true : false;

export type IsNever<T> = [T] extends [never] ? true : false;

export type IsUnknown<T> =
  IsAny<T> extends true ? false : unknown extends T ? true : false;

type IsExactlyUnknown<T> = [T] extends [unknown]
  ? [unknown] extends [T]
    ? true
    : false
  : false;

type IsUndefined<T> = [T] extends [undefined] ? true : false;

type IsMatchingEmptyObject<T> = [T] extends [{}]
  ? [{}] extends [T]
    ? true
    : false
  : false;

export type MaybeEmptyObject<
  TObj,
  TKey extends PropertyKey,
  TFallback = Record<string, unknown>,
> =
  IsUndefined<TObj> extends true
    ? { [K in TKey]?: TFallback }
    : IsExactlyUnknown<TObj> extends true
      ? { [K in TKey]?: TFallback }
      : IsMatchingEmptyObject<TObj> extends true
        ? { [K in TKey]?: TObj }
        : undefined extends TObj
          ? { [K in TKey]?: TObj }
          : null extends TObj
            ? { [K in TKey]?: TObj }
            : { [K in TKey]: TObj };

export type AnyTypedRoute = {
  body?: unknown;
  headers?: unknown;
  query?: unknown;
  params?: unknown;
  response: Record<number, unknown>;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type TreatyToPath<T, Path extends string = ""> = UnionToIntersect<
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: T[K] extends AnyTypedRoute
          ? { [path in Path]: { [method in K]: T[K] } }
          : unknown extends T[K]
            ? { [path in Path]: { [method in K]: T[K] } }
            : TreatyToPath<T[K], `${Path}/${K & string}`>;
      }[keyof T]
    : {}
>;

export type Not<T> = T extends true ? false : true;

// type Files = File | FileList

// type Replace<RecordType, TargetType, GenericType> = {
//     [K in keyof RecordType]: RecordType[K] extends TargetType
//         ? GenericType
//         : RecordType[K]
// }

type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

type ReplaceGeneratorWithAsyncGenerator<
  in out RecordType extends Record<string, unknown>,
> = {
  [K in keyof RecordType]: IsNever<RecordType[K]> extends true
    ? RecordType[K]
    : RecordType[K] extends Generator<infer A, infer B, infer C>
      ? void extends B
        ? AsyncGenerator<A, B, C>
        : And<IsNever<A>, void extends B ? false : true> extends true
          ? B
          : AsyncGenerator<A, B, C> | B
      : RecordType[K] extends AsyncGenerator<infer A, infer B, infer C>
        ? And<Not<IsNever<A>>, void extends B ? true : false> extends true
          ? AsyncGenerator<A, B, C>
          : And<IsNever<A>, void extends B ? false : true> extends true
            ? B
            : AsyncGenerator<A, B, C> | B
        : RecordType[K] extends ReadableStream<infer A>
          ? AsyncGenerator<A, void, unknown>
          : RecordType[K];
} & {};

type IntegerRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

type SuccessCodeRange = IntegerRange<200, 300>;

type MaybeArray<T> = T | T[];

type MaybeArrayFile<T> = T extends (File | BunFile)[]
  ? (File | BunFile)[] | File | BunFile
  : T extends File | BunFile
    ? File | BunFile
    : T;

type RelaxFileArrays<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: MaybeArrayFile<T[K]>;
      }
    : T;
type SerializeQueryParams<T> =
  T extends Record<string, any>
    ? {
        [K in keyof T]: T[K] extends Date
          ? string
          : T[K] extends Date | undefined
            ? string | undefined
            : T[K];
      }
    : T;

export namespace MyEdenTreaty {
  interface TreatyParam {
    fetch?: RequestInit;
  }

  export type Create<App extends Elysia<any, any, any, any, any, any, any>> =
    App extends {
      "~Routes": infer Schema extends Record<any, any>;
    }
      ? Prettify<Sign<Schema>> & CreateParams<Schema>
      : "Please install Elysia before using Eden";

  export type Sign<in out Route extends Record<any, any>> = {
    [K in keyof Route as K extends `:${string}`
      ? never
      : K]: K extends "subscribe" // ? Websocket route
      ? MaybeEmptyObject<Route["subscribe"]["headers"], "headers"> &
          MaybeEmptyObject<
            SerializeQueryParams<Route["subscribe"]["query"]>,
            "query"
          > extends infer Param
        ? (options?: Param) => EdenWS<Route["subscribe"]>
        : never
      : Route[K] extends {
            body: infer Body;
            headers: infer Headers;
            params: any;
            query: infer Query;
            response: infer Res extends Record<number, unknown>;
          }
        ? MaybeEmptyObject<Headers, "headers"> &
            MaybeEmptyObject<
              SerializeQueryParams<Query>,
              "query"
            > extends infer Param
          ? {} extends Param
            ? undefined extends Body
              ? K extends "get" | "head"
                ? (
                    options?: Prettify<Param & TreatyParam>,
                  ) => Promise<
                    TreatyResponse<ReplaceGeneratorWithAsyncGenerator<Res>>
                  >
                : (
                    body?: RelaxFileArrays<Body>,
                    options?: Prettify<Param & TreatyParam>,
                  ) => Promise<
                    TreatyResponse<ReplaceGeneratorWithAsyncGenerator<Res>>
                  >
              : K extends "get" | "head"
                ? (
                    options?: Prettify<Param & TreatyParam>,
                  ) => Promise<
                    TreatyResponse<ReplaceGeneratorWithAsyncGenerator<Res>>
                  >
                : {} extends Body
                  ? (
                      body?: RelaxFileArrays<Body>,
                      options?: Prettify<Param & TreatyParam>,
                    ) => Promise<
                      TreatyResponse<ReplaceGeneratorWithAsyncGenerator<Res>>
                    >
                  : (
                      body: RelaxFileArrays<Body>,
                      options?: Prettify<Param & TreatyParam>,
                    ) => Promise<
                      TreatyResponse<ReplaceGeneratorWithAsyncGenerator<Res>>
                    >
            : K extends "get" | "head"
              ? (
                  options: Prettify<Param & TreatyParam>,
                ) => Promise<
                  TreatyResponse<ReplaceGeneratorWithAsyncGenerator<Res>>
                >
              : (
                  body: RelaxFileArrays<Body>,
                  options: Prettify<Param & TreatyParam>,
                ) => Promise<
                  TreatyResponse<ReplaceGeneratorWithAsyncGenerator<Res>>
                >
          : never
        : CreateParams<Route[K]>;
  };

  type CreateParams<Route extends Record<string, any>> =
    Extract<keyof Route, `:${string}`> extends infer Path extends string
      ? IsNever<Path> extends true
        ? Prettify<Sign<Route>>
        : // ! DO NOT USE PRETTIFY ON THIS LINE, OTHERWISE FUNCTION CALLING WILL BE OMITTED
          (((params: {
            [param in Path extends `:${infer Param}`
              ? Param extends `${infer Param}?`
                ? Param
                : Param
              : never]: string | number;
          }) => Prettify<Sign<Route[Path]>> & CreateParams<Route[Path]>) &
            Prettify<Sign<Route>>) &
            (Path extends `:${string}?` ? CreateParams<Route[Path]> : {})
      : never;

  export interface Config {
    fetch?: Omit<RequestInit, "headers" | "method">;
    fetcher?: typeof fetch;
    headers?: MaybeArray<
      | RequestInit["headers"]
      | ((
          path: string,
          options: RequestInit,
        ) => MaybePromise<RequestInit["headers"] | void>)
    >;
    onRequest?: MaybeArray<
      (path: string, options: RequestInit) => MaybePromise<RequestInit | void>
    >;
    onResponse?: MaybeArray<(response: Response) => MaybePromise<unknown>>;
    keepDomain?: boolean;
  }

  // type UnwrapAwaited<T extends Record<number, unknown>> = {
  //     [K in keyof T]: Awaited<T[K]>
  // }

  export type TreatyResponse<Res extends Record<number, unknown>> = Res[Extract<
    keyof Res,
    SuccessCodeRange
  >] extends {
    [ELYSIA_FORM_DATA]: infer Data;
  }
    ? Data
    : Res[Extract<keyof Res, SuccessCodeRange>] | null;

  export interface OnMessage<Data = unknown> extends MessageEvent {
    data: Data;
    rawData: MessageEvent["data"];
  }

  export type WSEvent<
    K extends keyof WebSocketEventMap,
    Data = unknown,
  > = K extends "message" ? OnMessage<Data> : WebSocketEventMap[K];

  type MaybeFunction<T> = T | ((...a: any) => T);
  type UnwrapMaybeFunction<T> = T extends (...a: any) => infer R ? R : T;

  type MaybePromise<T> = T | Promise<T>;

  export type Data<
    Response extends MaybeFunction<
      MaybePromise<MyEdenTreaty.TreatyResponse<{}>>
    >,
  > = NonNullable<Awaited<UnwrapMaybeFunction<Response>>>;

  export type Error<
    Response extends MaybeFunction<
      MaybePromise<MyEdenTreaty.TreatyResponse<{}>>
    >,
  > = NonNullable<Awaited<UnwrapMaybeFunction<Response>>>;
}
