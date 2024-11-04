import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class ExperienceModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.EXPERIENCE,
            columns: [],
        });
    }
}
