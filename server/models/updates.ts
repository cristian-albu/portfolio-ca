import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";
import { UPDATE_DATA } from "./utils/table_metadata";

export const updatesSchema = z.object({
    [UPDATE_DATA.id.text]: z.string().uuid(),
    [UPDATE_DATA.title.text]: z.string().max(UPDATE_DATA.title.max),
    [UPDATE_DATA.description.text]: z.string().max(UPDATE_DATA.description.max),
    [UPDATE_DATA.url_title.text]: z.string().max(UPDATE_DATA.url_title.max),
    [UPDATE_DATA.url.text]: z.string().max(UPDATE_DATA.url.max).url(),
    [UPDATE_DATA.publish_date.text]: z.string().datetime(),
});

export type Db_Updates = z.infer<typeof updatesSchema> & DB_Timestamps;

export default class UpdatesModel extends BaseModel<Db_Updates> {
    constructor() {
        super({ tableName: TableNames.UPDATES });
    }

    public async createTable(): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS ${TableNames.UPDATES} (
      ${UPDATE_DATA.id.text} uuid PRIMARY KEY,
      ${UPDATE_DATA.title.text} VARCHAR(${UPDATE_DATA.title.max}) NOT NULL,
      ${UPDATE_DATA.description.text} VARCHAR(${UPDATE_DATA.description.max}) NOT NULL,
      ${UPDATE_DATA.url_title.text} VARCHAR(${UPDATE_DATA.url_title.max}) NOT NULL,
      ${UPDATE_DATA.url.text} VARCHAR(${UPDATE_DATA.url.max}) NOT NULL,
      ${UPDATE_DATA.publish_date.text} TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

        await QueryHandler.handleCommitQuery(query);
    }
}
