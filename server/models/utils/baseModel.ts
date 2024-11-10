import QueryHandler from "./queryHandler";
import SchemaHandler from "./schemaHandler";
import type { Sql_DataTypes, TableMetadata } from "./types";

export enum TableNames {
    SKILLS = "skills",
    ARTICLES = "articles",
    UPDATES = "updates",
    EXPERIENCE = "experience",
    SERVICES = "services",
    PROJECTS = "projects",
    CASE_STUDIES = "case_studies",
    DOCUMENTS = "documents",
}

export enum SqlDataTypes {
    VARCHAR = "varchar",
    INTEGER = "integer",
    BOOL = "bool",
    UUID = "uuid",
    TIMESTAMP = "timestamp",
    ENUM = "enum",
    JSON = "json",
}

export default class BaseModel {
    public tableName: TableNames | string;
    public columns: Sql_DataTypes[];
    public sqlSchemaPath: string | null = null;
    public zodSchemaPath: string | null = null;

    static instaces: Record<TableNames | string, BaseModel> = {};

    constructor({ tableName, columns }: TableMetadata) {
        this.tableName = tableName;
        this.columns = [
            { column: "id", type: SqlDataTypes.UUID, primary_key: true },
            ...columns,
            {
                column: "createdAt",
                type: SqlDataTypes.TIMESTAMP,
                default_now: true,
                notNull: true,
            },
            {
                column: "updatedAt",
                type: SqlDataTypes.TIMESTAMP,
                default_now: true,
                notNull: true,
            },
        ];

        BaseModel.instaces[this.tableName] = this;
    }

    static getInstances() {
        return BaseModel.instaces;
    }

    static async initSchemas() {
        if (Object.keys(this.instaces).length === 0) {
            console.log("No schemas found");
            return;
        }

        try {
            for await (const instance of Object.values(this.instaces)) {
                await instance.initSchema();
            }
        } catch (error) {
            console.error(error);
        }

        console.log("Schemas created");
    }

    public async initSchema(schemaPath?: string) {
        const { sqlPath, zodPath } = await SchemaHandler.createSchema(
            {
                tableName: this.tableName,
                columns: this.columns,
            },
            schemaPath
        );
        this.sqlSchemaPath = sqlPath;
        this.zodSchemaPath = zodPath;
    }

    public async executeSqlSchema() {
        if (this.sqlSchemaPath === null) {
            console.error(`No schema exists for ${this.tableName}`);
            throw new Error(`No schema exists for ${this.tableName}`);
        }

        try {
            const sqlFile = Bun.file(this.sqlSchemaPath);
            const fileContents = await sqlFile.text();
            await QueryHandler.handleCommitQuery(fileContents);
        } catch (error) {
            console.error("Schema migration error ", error);
            throw new Error("Schema migration error");
        }
    }

    public async findAll() {
        const result = await QueryHandler.handleReadQuery(
            `SELECT * FROM ${this.tableName};`
        );
        return result.rows;
    }

    public async findById(id: string) {
        const result = await QueryHandler.handleReadQuery(
            `SELECT * FROM ${this.tableName} WHERE id=$1 LIMIT 1;`,
            [id]
        );

        return result.rows[0];
    }

    public async createOne(entry: Record<string, unknown>) {
        const { columns, values } = Object.entries(entry).reduce(
            (accum, [key, value]) => {
                accum.columns.push(key);
                accum.values.push(
                    typeof value === "number" ? value : `${value}`
                );
                return accum;
            },
            { columns: [] as string[], values: [] as (string | number)[] }
        );

        const result = await QueryHandler.handleCommitQuery(
            `INSERT INTO ${this.tableName} (${columns.join(
                ","
            )}) VALUES (${values
                .map((_, i) => `$${i + 1}`)
                .join(",")}) RETURNING *;`,
            values
        );

        return result.rows[0];
    }

    public async updateById(id: string, entry: Record<string, unknown>) {
        const columns = Object.keys(entry);
        const values = Object.values(entry).map((val) =>
            typeof val === "number" ? val : `${val}`
        );

        const setters = columns.map((col, index) => `${col}=$${index + 2}`);

        const result = await QueryHandler.handleCommitQuery(
            `UPDATE ${this.tableName} SET ${setters.join(
                ", "
            )} WHERE id=$1 RETURNING *;`,
            [id, ...values]
        );

        return result.rows[0];
    }

    public deleteById(id: string) {
        return QueryHandler.handleCommitQuery(
            `DELETE FROM ${this.tableName} WHERE id=$1;`,
            [id]
        );
    }

    public deleteAll() {
        return QueryHandler.handleCommitQuery(`DELETE FROM ${this.tableName};`);
    }
}
