import type { SqlDataTypes, TableNames } from "./table_metadata";

export type Sql_Varchar = {
    column: string;
    max: number;
    type: SqlDataTypes.VARCHAR;
    url?: boolean;
};

export type Sql_Integer = {
    column: string;
    default?: number;
    positive?: boolean;
    type: SqlDataTypes.INTEGER;
};

export type Sql_Bool = {
    column: string;
    default: boolean;
    type: SqlDataTypes.BOOL;
};

export type Sql_Uuid = {
    column: string;
    primary_key: boolean;
    type: SqlDataTypes.UUID;
};

export type Sql_Timestamp = {
    column: string;
    default_now: boolean;
    type: SqlDataTypes.TIMESTAMP;
};

export type Sql_Enum = {
    column: string;
    enumName: string;
    values: string[];
    default?: string;
    type: SqlDataTypes.ENUM;
};

export type Sql_Json = {
    column: string;
    type: SqlDataTypes.JSON;
};

export type Sql_DataTypes = (
    | Sql_Varchar
    | Sql_Integer
    | Sql_Bool
    | Sql_Uuid
    | Sql_Timestamp
    | Sql_Enum
    | Sql_Json
) & { notNull?: boolean };

export type TableMetadata = {
    tableName: TableNames;
    columns: Sql_DataTypes[];
};
