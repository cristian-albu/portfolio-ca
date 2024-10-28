import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps as Db_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

enum E_SkillCategory {
  FRONT_END = "front-end",
  BACK_END = "back-end",
}

export const skillsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255).min(1),
  description: z.string().max(255).min(5),
  category: z.nativeEnum(E_SkillCategory),
  icon: z.string().url(),
});

export type Db_Skills = z.infer<typeof skillsSchema> & Db_Timestamps;

export default class SkillModel extends BaseModel<Db_Skills> {
  constructor() {
    super({
      tableName: TableNames.SKILLS,
    });
  }

  public async createTable(): Promise<void> {
    const query = "";
    await QueryHandler.handleCommitQuery(query, []);
  }
}
