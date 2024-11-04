import type { BunFile } from "bun";
import { unlink } from "node:fs/promises";
import { SqlDataTypes } from "./baseModel";
import {
    Sql_Relations,
    type Sql_Bool,
    type Sql_DataTypes,
    type Sql_Enum,
    type Sql_Integer,
    type Sql_Json,
    type Sql_ManyToOne,
    type Sql_OneToOne,
    type Sql_Timestamp,
    type Sql_Uuid,
    type Sql_Varchar,
    type TableMetadata,
} from "./types";

type T_SqlZodSchema = {
    sql: string;
    zod: string;
};

export default abstract class SchemaHandler {
    private static createEnumType(enumName: string, values: string[]) {
        return `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumName}') THEN
                CREATE TYPE ${enumName} AS ENUM(${values
            .map((value) => `'${value}'`)
            .join(", ")});
            END IF;
        END $$;

      `;
    }

    private static handleOneToOne(col: Sql_OneToOne) {
        let sql = `${col.column} uuid UNIQUE REFERENCES ${col.references}(id) ON DELETE CASCADE`;
        let zod = `${col.column}: z.string().uuid()`;

        return {
            sql,
            zod,
        };
    }

    private static handleManyToOne(col: Sql_ManyToOne) {
        let sql = `${col.column} uuid REFERENCES ${col.references}(id) ON DELETE CASCADE`;
        let zod = `${col.column}: z.string().uuid()`;

        return {
            sql,
            zod,
        };
    }

    private static handleBasicUuid(col: Sql_Uuid) {
        let sql = `${col.column} uuid`;
        let zod = `${col.column}: z.string().uuid()`;

        if (col.primary_key) {
            sql += " PRIMARY KEY";
        } else {
            col.notNull ? (sql += " NOT NULL") : (zod += " || z.null()");
        }

        return {
            sql,
            zod,
        };
    }

    private static handleUuid(
        col: Sql_Uuid | Sql_ManyToOne | Sql_OneToOne
    ): T_SqlZodSchema {
        if (!("relation" in col)) {
            return this.handleBasicUuid(col);
        }

        switch (col.relation) {
            case Sql_Relations.oneToOne:
                return this.handleOneToOne(col);
            case Sql_Relations.manyToOne:
                return this.handleManyToOne(col);
            default:
                console.error("Relation type not defined");
                throw new Error("Relation type not defined");
        }
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
        let zod = `${col.column}: z.enum([${[...col.values].map(
            (v) => `"${v}"`
        )}])`;

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
        let sql = `${col.column} JSONB`;
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
        export type Db_${tableName} = z.infer<typeof ${tableName}Schema>;\n
        export type Db_${tableName}_body = Omit<Db_${tableName}, 'id'|'createdAt'|'updatedAt'>`.replace(
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
                if (await Bun.file(sqlPath).exists()) {
                    console.log("Deleted old sql file file");
                    await unlink(sqlPath);
                }
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
            ${sqlColumns.join(",\n")}
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

    public static async createManyToManyRelation(
        table1: string,
        table2: string,
        basePath = "./server/models/schemas"
    ) {
        const firstId = `${table1}_id`;
        const sceondId = `${table2}_id`;
        const tableName = `${table1}_${table2}`;
        const sqlQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (
            ${firstId} uuid REFERENCES ${table1}(id) ON DELETE CASCADE,
            ${sceondId} uuid REFERENCES ${table2}(id) ON DELETE CASCADE,
            PRIMARY KEY (${firstId}, ${sceondId})
        );`;

        const zodQuery = `import z from 'zod';\nexport const ${tableName}Schema = z.object({\n
            ${firstId}: z.string().uuid(),\n
            ${sceondId}: z.string().uuid()\n
        });\n
        export type Db_${tableName} = z.infer<typeof ${tableName}Schema>;
        `;

        await Promise.all([
            Bun.write(`${basePath}/${tableName}.sql`, sqlQuery),
            Bun.write(`${basePath}/${tableName}_zod.ts`, zodQuery),
        ]);
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
