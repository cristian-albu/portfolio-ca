import QueryHandler from "./queryHandler";
import { SqlDataTypes, type TableNames } from "./table_metadata";
import type { Sql_DataTypes, TableMetadata } from "./types";

export default class BaseModel<T> {
    public tableName: TableNames;
    public columns: Sql_DataTypes[];
    public async createTable() {}

    constructor({ tableName, columns }: TableMetadata) {
        this.tableName = tableName;
        this.columns = columns;
    }

    public buildDefinitions() {
        const columnQueries: string[] = [];

        for (const col of this.columns) {
            let sqlDefinition = `${col.column}`;
            switch (col.type) {
                case SqlDataTypes.UUID:
                    sqlDefinition += " uuid";
                    if (col.primary_key) sqlDefinition += " PRIMARY KEY";
                    break;
                case SqlDataTypes.VARCHAR:
                    sqlDefinition += ` VARCHAR(${col.max})`;
                    break;
                case SqlDataTypes.INTEGER:
                    sqlDefinition += ` INTEGER`;
                    if (col.default) sqlDefinition += ` DEFAULT ${col.default}`;
                    break;
                case SqlDataTypes.BOOL:
                    break;
                case SqlDataTypes.ENUM:
                    break;
                case SqlDataTypes.JSON:
                    break;
                case SqlDataTypes.TIMESTAMP:
                    break;
            }

            if (col.notNull) {
                sqlDefinition += " NOT NULL";
            }

            columnQueries.push(sqlDefinition);
        }

        return { columnQueries };
    }

    public async findAll() {
        const result = await QueryHandler.handleReadQuery(`SELECT * FROM $1;`, [
            this.tableName,
        ]);
        return result.rows as T[];
    }

    public findOne() {}

    public createOne() {}

    public updateOne() {}

    public deleteOne() {}

    public deleteAll() {
        return QueryHandler.handleCommitQuery(`DELETE * FROM $1`, [
            this.tableName,
        ]);
    }
}
