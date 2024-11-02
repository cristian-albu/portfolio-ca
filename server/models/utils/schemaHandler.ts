import type { BunFile } from "bun";
import { SqlDataTypes } from "./baseModel";
import type {
    Sql_Bool,
    Sql_DataTypes,
    Sql_Enum,
    Sql_Integer,
    Sql_Json,
    Sql_Timestamp,
    Sql_Uuid,
    Sql_Varchar,
    TableMetadata,
} from "./types";

type T_SqlZodSchema = {
    sql: string;
    zod: string;
};

export default abstract class SchemaHandler {
    private static createEnumType(enumName: string, values: string[]) {
        return `
        CREATE TYPE ${enumName} AS ENUM(${values
            .map((value) => `'${value}'`)
            .join(", ")});
      `;
    }

    private static handleUuid(col: Sql_Uuid): T_SqlZodSchema {
        let sql = `${col.column} uuid`;
        let zod = `${col.column}: z.string().uuid()`;

        if (col.primary_key) sql += " PRIMARY KEY";

        col.notNull ? (sql += " NOT NULL") : (zod += " || z.null()");

        return {
            sql,
            zod,
        };
    }

    private static handleVarChar(col: Sql_Varchar): T_SqlZodSchema {
        let sql = `${col.column} VARCHAR(${col.max})`;
        let zod = `${col.column}: z.string().max(${col.max})`;

        if (col.url) {
            zod += ".url()";
        }

        col.notNull ? (sql += " NOT NULL") : (zod += " || z.null()");

        return {
            sql,
            zod,
        };
    }

    private static handleInteger(col: Sql_Integer): T_SqlZodSchema {
        let sql = `${col.column} INTEGER`;
        let zod = `${col.column}: z.number()`;

        if (col.default !== undefined) {
            sql += ` DEFAULT ${col.default}`;
            zod += `.default(${col.default})`;
        }
        if (col.positive) {
            zod += ".positive()";
        }

        col.notNull ? (sql += " NOT NULL") : (zod += " || z.null()");

        return {
            sql,
            zod,
        };
    }

    private static handleBool(col: Sql_Bool): T_SqlZodSchema {
        let sql = `${col.column} BOOLEAN`;
        let zod = `${col.column}: z.boolean()`;

        if (col.default !== undefined) {
            sql += ` DEFAULT ${col.default}`;
            zod += `.default(${col.default})`;
        }

        col.notNull ? (sql += " NOT NULL") : (zod += " || z.null()");

        return {
            sql,
            zod,
        };
    }

    private static handleEnum(col: Sql_Enum): T_SqlZodSchema {
        let sql = `${col.column} ${col.enumName}`;
        let zod = `${col.column}: z.enum(${[...col.values]})`;

        if (col.default) {
            sql += ` DEFAULT '${col.default}'`;
            zod += `.default("${col.default}")`;
        }

        col.notNull ? (sql += " NOT NULL") : (zod += " || z.null()");

        return {
            sql,
            zod,
        };
    }

    private static handleJson(col: Sql_Json): T_SqlZodSchema {
        let sql = `${col.column} JSON`;
        let zod = `${col.column}: z.string().refine(
            (str) => {
                try {
                    JSON.parse(str);
                    return true;
                } catch {
                    return false;
                }
            },
            { message: "Body must be a valid JSON string" }
        )`;

        col.notNull ? (sql += " NOT NULL") : (zod += " || z.null()");

        return {
            sql,
            zod,
        };
    }

    private static handleTimestamp(col: Sql_Timestamp): T_SqlZodSchema {
        let sql = `${col.column} TIMESTAMP`;
        let zod = `${col.column}: z.string().datetime()`;

        if (col.default_now) {
            sql += ` DEFAULT NOW()`;
            zod += `.default(() => new Date().toISOString())`;
        }

        col.notNull ? (sql += " NOT NULL") : (zod += " || z.null()");

        return {
            sql,
            zod,
        };
    }

    private static handleColumnDefinition(col: Sql_DataTypes): T_SqlZodSchema {
        switch (col.type) {
            case SqlDataTypes.UUID:
                return this.handleUuid(col);
            case SqlDataTypes.VARCHAR:
                return this.handleVarChar(col);
            case SqlDataTypes.INTEGER:
                return this.handleInteger(col);
            case SqlDataTypes.BOOL:
                return this.handleBool(col);
            case SqlDataTypes.ENUM:
                return this.handleEnum(col);
            case SqlDataTypes.JSON:
                return this.handleJson(col);
            case SqlDataTypes.TIMESTAMP:
                return this.handleTimestamp(col);
            default:
                throw new Error("Not a handled data type");
        }
    }

    private static async handleZodFile(
        tableName: string,
        basePath: string,
        zodColumns: string[]
    ) {
        const zodQuery = `import z from 'zod';
        export const ${tableName}Schema = z.object({
            ${zodColumns.join(",\n")}
        });
        export type Db_${tableName} = z.infer<typeof ${tableName}Schema>;`.replace(
            /^\s+/gm,
            ""
        );

        const zodPath = `${basePath}/${tableName}_zod.ts`;

        try {
            await Bun.write(zodPath, zodQuery);
            console.log(`${tableName} zod schema created`);
        } catch (error) {
            console.error(`${tableName} zod schema failed`, error);
            throw new Error("Zod schema creation failed");
        }

        return zodPath;
    }

    private static async handleSqlFileAlterning(
        sqlFile: BunFile,
        tableName: string,
        sqlColumns: string[],
        sqlPath: string
    ) {
        const fileContents = await sqlFile.text();
        const createText = `CREATE TABLE IF NOT EXISTS ${tableName} (`;

        const createStatement = fileContents
            .split(";")
            .find((statement) => statement.includes(createText));

        if (!createStatement) {
            throw new Error("No create statement found in file");
        }

        const currentColumns = createStatement
            .replace(createText, "")
            .trim()
            .slice(0, -1)
            .split(",")
            .map((col) => col.trim().replace(/\s*\n\s*/g, ""))
            .filter((col) => col.length > 0);

        console.log(currentColumns);

        const currentAlterColumns = fileContents
            .split(`ALTER TABLE ${tableName} `)
            .slice(1)
            .map((statement) => statement.trim().split(","))
            .flat()
            .map((column) =>
                column
                    .trim()
                    .replace("ADD ", "")
                    .replace(";", "")
                    .replace(/\s*\n\s*/g, "")
            )

            .filter((col) => col.length > 0);

        const existingColumnSet = new Set([
            ...currentColumns,
            ...currentAlterColumns,
        ]);

        const newColumns = sqlColumns
            .map((col) => col.trim())
            .filter((newCol) => !existingColumnSet.has(newCol)); // Only include new columns

        if (newColumns.length > 0) {
            const query = `ALTER TABLE ${tableName} ADD ${newColumns.join(
                ", ADD "
            )};`;

            try {
                await Bun.write(sqlPath, `${fileContents}\n${query}`);
                console.log(
                    `${tableName} schema altered with new columns: ${newColumns.join(
                        ", "
                    )}`
                );
            } catch (error) {
                console.error(`${tableName} schema alteration failed`, error);
                throw new Error("SQL schema alteration failed");
            }
        } else {
            console.log(`No new columns to add to ${tableName}.`);
        }
    }

    private static async handleSqlFileCreation(
        tableName: string,
        sqlColumns: string[],
        sqlPath: string,
        sqlEnums: string
    ) {
        const sqlQuery = `${sqlEnums}CREATE TABLE IF NOT EXISTS ${tableName} (
            ${sqlColumns.join(",")}
        );`.replace(/^\s+/gm, "");

        try {
            await Bun.write(sqlPath, sqlQuery);
            console.log(`${tableName} schema created`);
        } catch (error) {
            console.error(`${tableName} schema failed`, error);
            throw new Error("Sql schema creation failed");
        }
    }

    private static async handleSqlFile(
        tableName: string,
        basePath: string,
        sqlColumns: string[],
        sqlEnums: string
    ) {
        const sqlPath = `${basePath}/${tableName}.sql`;
        const sqlFile = Bun.file(sqlPath);

        if (await sqlFile.exists()) {
            await this.handleSqlFileAlterning(
                sqlFile,
                tableName,
                sqlColumns,
                sqlPath
            );
        } else {
            await this.handleSqlFileCreation(
                tableName,
                sqlColumns,
                sqlPath,
                sqlEnums
            );
        }

        return sqlPath;
    }

    /**
     * Zod schema will be created every time based on the metadata provided from each model. This will overwrite the previous one.
     * Sql schema will do the same if there are no modifications.
     * If there are any modifications to the model columns, an ALTER statement will be added to the file.
     * NOTE: This only works with ADDING new columns but it does not work with REMOVING or RENAMING.
     */
    public static async createSchema(
        metadata: TableMetadata,
        basePath = "./server/models/schemas"
    ) {
        const sqlColumns: string[] = [];
        const zodColumns: string[] = [];
        let sqlEnums = ``;

        metadata.columns.forEach((col) => {
            if (col.type === SqlDataTypes.ENUM)
                sqlEnums += `${this.createEnumType(col.enumName, col.values)} `;

            const { sql, zod } = this.handleColumnDefinition(col);

            sqlColumns.push(sql);
            zodColumns.push(zod);
        });

        try {
            const [zodPath, sqlPath] = await Promise.all([
                this.handleZodFile(metadata.tableName, basePath, zodColumns),
                this.handleSqlFile(
                    metadata.tableName,
                    basePath,
                    sqlColumns,
                    sqlEnums
                ),
            ]);

            return {
                sqlPath,
                zodPath,
            };
        } catch (error) {
            console.error(`${metadata.tableName} schema failed`, error);
            throw new Error("Schemas creation failed");
        }
    }
}
