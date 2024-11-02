import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class UpdatesModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.UPDATES,
            columns: [
                { column: "id", type: SqlDataTypes.UUID, primary_key: true },
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
