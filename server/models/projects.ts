import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class ProjectModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.PROJECTS,
            columns: [],
        });
    }
}
