import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class ArticlesModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.ARTICLES,
            columns: [
                { column: "id", type: SqlDataTypes.UUID, primary_key: true },
                { column: "title", type: SqlDataTypes.VARCHAR, max: 255 },
                {
                    column: "description",
                    type: SqlDataTypes.VARCHAR,
                    max: 255,
                },
                {
                    column: "createdAt",
                    type: SqlDataTypes.TIMESTAMP,
                    default_now: true,
                },
                {
                    column: "updatedAt",
                    type: SqlDataTypes.TIMESTAMP,
                    default_now: true,
                },
            ],
        });
    }
}
