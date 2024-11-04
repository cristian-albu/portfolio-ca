import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class CaseStudiesModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.CASE_STUDIES,
            columns: [],
        });
    }
}
