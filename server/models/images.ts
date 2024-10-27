import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

export const imagesSchema = z.object({
  id: z.string().uuid(),
});

export type Db_Images = z.infer<typeof imagesSchema> & DB_Timestamps;

export default class ImagesModel extends BaseModel<Db_Images> {
  constructor() {
    super({ tableName: TableNames.IMAGES });
  }

  public async createTable(): Promise<void> {
    const query = "";
    await QueryHandler.handleCommitQuery(query, []);
  }
}
