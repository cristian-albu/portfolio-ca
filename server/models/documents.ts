import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

const NAME_MAX_LEN = 255;
const URL_MAX_LEN = 255;
const FILE_PATH_MAX_LEN = 255;
const FILE_TYPE = "file_type";

export enum E_FileType {
  PDF = "pdf",
  JPG = "jpg",
  JPEG = "jpeg",
  PNG = "png",
  SVG = "svg",
  CSV = "csv",
  MD = "md",
  JSON = "json",
  GZ = "gz",
  SQL = "sql",
}

export const documentsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(NAME_MAX_LEN),
  url: z.string().max(URL_MAX_LEN).url(),
  file_path: z.string().max(FILE_PATH_MAX_LEN),
  file_size: z.number().positive(),
  file_type: z.nativeEnum(E_FileType),
});

export type Db_Documents = z.infer<typeof documentsSchema> & DB_Timestamps;

export default class DocumentsModel extends BaseModel<Db_Documents> {
  constructor() {
    super({ tableName: TableNames.DOCUMENTS });
  }

  public async createTable(): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS ${TableNames.DOCUMENTS} (
      id uuid PRIMARY KEY,
      name VARCHAR(${NAME_MAX_LEN}) NOT NULL,
      url VARCHAR(${URL_MAX_LEN}) NOT NULL,
      file_path VARCHAR(${FILE_PATH_MAX_LEN}) NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      file_type ${FILE_TYPE} NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    await QueryHandler.createEnumType(FILE_TYPE, Object.values(E_FileType));
    await QueryHandler.handleCommitQuery(query);
  }
}
