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
    public tableName: TableNames;
    public columns: Sql_DataTypes[];
    public sqlSchemaPath: string | null = null;
    public zodSchemaPath: string | null = null;

    static instaces: BaseModel[] = [];

    constructor({ tableName, columns }: TableMetadata) {
        this.tableName = tableName;
        this.columns = columns;

        BaseModel.instaces.push(this);
    }

    static getInstances() {
        return BaseModel.instaces;
    }

    static async initSchemas() {
        if (this.instaces.length === 0) {
            console.log("No schemas found");
            return;
        }

        try {
            for await (const instance of this.instaces) {
                await instance.initSchema();
            }
        } catch (error) {
            console.error(error);
        }

        console.log("Schemas created");
    }

    public async initSchema() {
        const { sqlPath, zodPath } = await SchemaHandler.createSchema({
            tableName: this.tableName,
            columns: this.columns,
        });
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

    public async createOne(entry: Record<string, SqlDataTypes>) {
        const entryArr = Object.entries(entry);
        const { columns, values } = entryArr.reduce(
            (accum, current) => {
                const [key, value] = current;

                accum.columns.push(key);
                accum.values.push(
                    typeof value === "number" ? ` ${value}` : ` '${value}'`
                );

                return accum;
            },
            { columns: [] as string[], values: [] as string[] }
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

    public updateById(id: string, entry: Record<string, SqlDataTypes>) {
        const setters = Object.entries(entry).map(
            ([key, val]) =>
                `${key}=${typeof val === "number" ? val : `'${val}'`}`
        );

        return QueryHandler.handleCommitQuery(
            `UPDATE ${this.tableName} SET ${setters
                .map((_, i) => `$${i + 2}`)
                .join(",")} WHERE id=$1`,
            [id, ...setters]
        );
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
