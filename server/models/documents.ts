import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

export const documentsSchema = z.object({
  id: z.string().uuid(),
});

export type Db_Documents = z.infer<typeof documentsSchema> & DB_Timestamps;

export default class DocumentsModel extends BaseModel<Db_Documents> {
  constructor() {
    super({ tableName: TableNames.DOCUMENTS });
  }

  public async createTable(): Promise<void> {
    const query = "";
    await QueryHandler.handleCommitQuery(query, []);
  }
}
