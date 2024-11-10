import type { SqlDataTypes, TableNames } from "./baseModel";

export type Sql_Varchar = {
    column: string;
    max: number;
    type: SqlDataTypes.VARCHAR;
    url?: boolean;
    notNull?: boolean;
};

export type Sql_Integer = {
    column: string;
    default?: number;
    positive?: boolean;
    type: SqlDataTypes.INTEGER;
    notNull?: boolean;
};

export type Sql_Bool = {
    column: string;
    default: boolean;
    type: SqlDataTypes.BOOL;
    notNull?: boolean;
};

export type Sql_Uuid = {
    column: string;
    primary_key: boolean;
    type: SqlDataTypes.UUID;
    notNull?: boolean;
};

export type Sql_Timestamp = {
    column: string;
    default_now: boolean;
    type: SqlDataTypes.TIMESTAMP;
    notNull?: boolean;
};

export type Sql_Enum = {
    column: string;
    enumName: string;
    values: string[];
    default?: string;
    type: SqlDataTypes.ENUM;
    notNull?: boolean;
};

export type Sql_Json = {
    column: string;
    type: SqlDataTypes.JSON;
    notNull?: boolean;
};

export enum Sql_Relations {
    oneToOne = "one-to-one",
    manyToOne = "many-to-one",
    manyToMany = "many-to-many",
}

export type Sql_OneToOne = {
    column: string;
    type: SqlDataTypes.UUID;
    references: string;
    relation: Sql_Relations.oneToOne;
};

export type Sql_ManyToOne = {
    column: string;
    type: SqlDataTypes.UUID;
    references: string;
    relation: Sql_Relations.manyToOne;
};

export type Sql_DataTypes =
    | Sql_Varchar
    | Sql_Integer
    | Sql_Bool
    | Sql_Uuid
    | Sql_Timestamp
    | Sql_Enum
    | Sql_Json
    | Sql_ManyToOne
    | Sql_OneToOne;

export type TableMetadata = {
    tableName: TableNames | string;
    columns: Sql_DataTypes[];
};
