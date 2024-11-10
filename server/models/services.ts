import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class ServicesModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.SERVICES,
            columns: [],
        });
    }
}
