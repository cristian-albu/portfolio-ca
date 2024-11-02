import BaseModel, { SqlDataTypes, TableNames } from "./utils/baseModel";

export default class SkillsModel extends BaseModel {
    constructor() {
        super({
            tableName: TableNames.SKILLS,
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
