import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class ArticlesModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.ARTICLES,
            columns: [
                { column: "title", type: SqlDataTypes.VARCHAR, max: 255 },
                {
                    column: "description",
                    type: SqlDataTypes.VARCHAR,
                    max: 255,
                },
            ],
        });
    }
}
