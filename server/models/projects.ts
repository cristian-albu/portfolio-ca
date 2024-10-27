import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

export const projectsSchema = z.object({
  id: z.string().uuid(),
});

export type Db_Projects = z.infer<typeof projectsSchema> & DB_Timestamps;

export default class ProjectsModel extends BaseModel<Db_Projects> {
  constructor() {
    super({ tableName: TableNames.PROJECTS });
  }

  public async createTable(): Promise<void> {
    const query = "";
    await QueryHandler.handleCommitQuery(query, []);
  }
}
