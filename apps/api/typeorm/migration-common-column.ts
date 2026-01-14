import type { TableColumnOptions, TableIndexOptions } from "typeorm";

export enum MysqlDataType {
  int = "int",
  tinyint = "tinyint",
  smallint = "smallint",
  mediumint = "mediumint",
  bigint = "bigint",
  float = "float",
  double = "double",
  dec = "dec",
  decimal = "decimal",
  numeric = "numeric",
  date = "date",
  datetime = "datetime",
  timestamp = "timestamp",
  time = "time",
  year = "year",
  char = "char",
  varchar = "varchar",
  nvarchar = "nvarchar",
  text = "text",
  tinytext = "tinytext",
  mediumtext = "mediumtext",
  blob = "blob",
  longtext = "longtext",
  tinyblob = "tinyblob",
  mediumblob = "mediumblob",
  longblob = "longblob",
  enum = "enum",
  json = "json",
  binary = "binary",
  geometry = "geometry",
  point = "point",
  linestring = "linestring",
  polygon = "polygon",
  multipoint = "multipoint",
  multilinestring = "multilinestring",
  multipolygon = "multipolygon",
  geometrycollection = "geometrycollection",
}

export enum PgDataType {
  int = "int",
  "int2" = "int2",
  "int4" = "int4",
  "int8" = "int8",
  "smallint" = "smallint",
  "integer" = "integer",
  "bigint" = "bigint",
  "decimal" = "decimal",
  "numeric" = "numeric",
  "real" = "real",
  "float" = "float",
  "float4" = "float4",
  "float8" = "float8",
  "double precision" = "double precision",
  "money" = "money",
  "character varying" = "character varying",
  "varchar" = "varchar",
  "character" = "character",
  "char" = "char",
  "text" = "text",
  "citext" = "citext",
  "hstore" = "hstore",
  "bytea" = "bytea",
  "bit" = "bit",
  "varbit" = "varbit",
  "bit varying" = "bit varying",
  "timetz" = "timetz",
  "timestamptz" = "timestamptz",
  "timestamp" = "timestamp",
  "timestamp without time zone" = "timestamp without time zone",
  "timestamp with time zone" = "timestamp with time zone",
  "date" = "date",
  "time" = "time",
  "time without time zone" = "time without time zone",
  "time with time zone" = "time with time zone",
  "interval" = "interval",
  "bool" = "bool",
  "boolean" = "boolean",
  "enum" = "enum",
  "point" = "point",
  "line" = "line",
  "lseg" = "lseg",
  "box" = "box",
  "path" = "path",
  "polygon" = "polygon",
  "circle" = "circle",
  "cidr" = "cidr",
  "inet" = "inet",
  "macaddr" = "macaddr",
  "tsvector" = "tsvector",
  "tsquery" = "tsquery",
  "uuid" = "uuid",
  "xml" = "xml",
  "json" = "json",
  "jsonb" = "jsonb",
  "int4range" = "int4range",
  "int8range" = "int8range",
  "numrange" = "numrange",
  "tsrange" = "tsrange",
  "tstzrange" = "tstzrange",
  "daterange" = "daterange",
  "int4multirange" = "int4multirange",
  "int8multirange" = "int8multirange",
  "nummultirange" = "nummultirange",
  "tsmultirange" = "tsmultirange",
  "tstzmultirange" = "tstzmultirange",
  "multidaterange" = "multidaterange",
  "geometry" = "geometry",
  "geograph" = "geograph",
}

export const Id: (tableName: string) => TableColumnOptions = (tableName) => ({
  name: "id",
  type: PgDataType.int,
  isPrimary: true,
  isGenerated: true,
  generationStrategy: "increment",
  comment: "id",
  primaryKeyConstraintName: `pk_${tableName}_id`,
});

export const MchId: TableColumnOptions = {
  name: "mch_id",
  type: PgDataType.int,
  unsigned: true,
  comment: "商户id",
  default: 0,
};

export const MchIndex: (tableName: string) => TableIndexOptions = (
  tableName
) => ({
  columnNames: ["mch_id"],
  name: `idx_${tableName}_mch_id`,
});

export const CreatedAt: TableColumnOptions = {
  name: "created_at",
  type: PgDataType.timestamp,
  default: "NOW()",
  comment: "创建时间",
};

export const UpdatedAt: TableColumnOptions = {
  name: "updated_at",
  type: PgDataType.timestamp,
  default: "NOW()",
  comment: "修改时间",
};

export const DeletedAt: TableColumnOptions = {
  name: "deleted_at",
  type: PgDataType.timestamp,
  isNullable: true,
  default: "NULL",
  comment: "删除时间",
};

export const Sort: TableColumnOptions = {
  name: "sort",
  type: PgDataType.int,
  default: 0,
  comment: "排序",
};

export const Active: TableColumnOptions = {
  name: "active",
  type: PgDataType.boolean,
  length: "1",
  default: true,
  comment: "启用",
};
export const ActiveIndex: (tableName: string) => TableIndexOptions = (
  tableName
) => ({
  columnNames: ["active"],
  name: `idx_${tableName}_active`,
});

export const CreatorId: TableColumnOptions = {
  name: "creator_id",
  type: PgDataType.int,
  unsigned: true,
  comment: "创建人id",
  default: 0,
};

export const SortIndex: (tableName: string) => TableIndexOptions = (
  tableName
) => ({
  columnNames: ["sort"],
  name: `idx_${tableName}_sort`,
});

export const CreatedAtIndex: (tableName: string) => TableIndexOptions = (
  tableName
) => ({
  columnNames: ["created_at"],
  name: `idx_${tableName}_created_at`,
});

export const UpdatedAtIndex: (tableName: string) => TableIndexOptions = (
  tableName
) => ({
  columnNames: ["updated_at"],
  name: `idx_${tableName}_updated_at`,
});

export const DeletedAtIndex: (tableName: string) => TableIndexOptions = (
  tableName
) => ({
  columnNames: ["deleted_at"],
  name: `idx_${tableName}_deleted_at`,
});

export const TeamId: TableColumnOptions = {
  name: "team_id",
  type: PgDataType.int,
  unsigned: true,
  comment: "团队id",
  isNullable: true,
};

export const TeamIndex: (tableName: string) => TableIndexOptions = (
  tableName
) => ({
  columnNames: ["team_id"],
  name: `idx_${tableName}_team_id`,
});

export const CaseId: TableColumnOptions = {
  name: "case_id",
  type: PgDataType.int,
  unsigned: true,
  comment: "案件id",
};

export const CaseIndex: (tableName: string) => TableIndexOptions = (
  tableName
) => ({
  columnNames: ["case_id"],
  name: `idx_${tableName}_case_id`,
});
