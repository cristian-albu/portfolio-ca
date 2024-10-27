import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

export const updatesSchema = z.object({
  id: z.string().uuid(),
});

export type Db_Updates = z.infer<typeof updatesSchema> & DB_Timestamps;

export default class UpdatesModel extends BaseModel<Db_Updates> {
  constructor() {
    super({ tableName: TableNames.UPDATES });
  }

  public async createTable(): Promise<void> {
    const query = "";
    await QueryHandler.handleCommitQuery(query, []);
  }
}
