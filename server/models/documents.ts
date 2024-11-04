import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class DocumentsModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.DOCUMENTS,
            columns: [],
        });
    }
}
