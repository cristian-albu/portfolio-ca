import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

export const servicesSchema = z.object({
  id: z.string().uuid(),
});

export type Db_Services = z.infer<typeof servicesSchema> & DB_Timestamps;

export default class ServicesModel extends BaseModel<Db_Services> {
  constructor() {
    super({ tableName: TableNames.SERVICES });
  }

  public async createTable(): Promise<void> {
    const query = "";
    await QueryHandler.handleCommitQuery(query, []);
  }
}
