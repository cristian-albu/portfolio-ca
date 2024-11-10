import BaseModel, { SqlDataTypes, TableNames } from "../models/utils/baseModel";

export default class UpdatesModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.UPDATES,
            columns: [
                { column: "title", type: SqlDataTypes.VARCHAR, max: 255 },
            ],
        });
    }
}
