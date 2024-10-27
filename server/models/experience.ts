import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

export const experienceSchema = z.object({
  id: z.string().uuid(),
});

export type Db_Experience = z.infer<typeof experienceSchema> & DB_Timestamps;

export default class ExperienceModel extends BaseModel<Db_Experience> {
  constructor() {
    super({ tableName: TableNames.EXPERIENCE });
  }

  public async createTable(): Promise<void> {
    const query = "";
    await QueryHandler.handleCommitQuery(query, []);
  }
}
