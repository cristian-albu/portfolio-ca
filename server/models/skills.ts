import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class SkillsModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.SKILLS,
            columns: [],
        });
    }
}
