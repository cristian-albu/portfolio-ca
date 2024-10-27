import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

export const caseStudiesSchema = z.object({
  id: z.string().uuid(),
});

export type Db_CaseStudies = z.infer<typeof caseStudiesSchema> & DB_Timestamps;

export default class CaseStudiesModel extends BaseModel<Db_CaseStudies> {
  constructor() {
    super({ tableName: TableNames.CASE_STUDIES });
  }

  public async createTable(): Promise<void> {
    const query = "";
    await QueryHandler.handleCommitQuery(query, []);
  }
}
