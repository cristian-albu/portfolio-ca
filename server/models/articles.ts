import { z } from "zod";
import { TableNames } from "../lib/tableNames";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";

const TITLE_MAX_LEN = 255;
const DESC_MAX_LEN = 255;
const THUMB_MAX_LEN = 255;
const ARTICLE_CATEGORY_NAME = "article_category";

enum E_ArticleCategory {
  TECH = "tech",
}

export const articlesSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(TITLE_MAX_LEN),
  description: z.string().max(DESC_MAX_LEN),
  thumbnail: z.string().max(THUMB_MAX_LEN).url(),
  category: z.enum(Object.values(E_ArticleCategory) as [E_ArticleCategory, ...E_ArticleCategory[]]),
  body: z.string().refine(
    (str) => {
      try {
        JSON.parse(str);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Body must be a valid JSON string" }
  ),
});

export type Db_Articles = z.infer<typeof articlesSchema> & DB_Timestamps;

export default class ArticlesModel extends BaseModel<Db_Articles> {
  constructor() {
    super({ tableName: TableNames.ARTICLES });
  }

  public async createTable(): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS ${TableNames.ARTICLES} (
        id UUID PRIMARY KEY,
        title VARCHAR(${TITLE_MAX_LEN}) NOT NULL,
        description VARCHAR(${DESC_MAX_LEN}) NOT NULL,
        thumbnail VARCHAR(${THUMB_MAX_LEN}) NOT NULL,
        category ${ARTICLE_CATEGORY_NAME} NOT NULL DEFAULT '${E_ArticleCategory.TECH}',
        body JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await QueryHandler.createEnumType(ARTICLE_CATEGORY_NAME, Object.values(E_ArticleCategory));
    await QueryHandler.handleCommitQuery(query);
  }
}
