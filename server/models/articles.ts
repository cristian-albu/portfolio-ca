import { z } from "zod";
import BaseModel from "./utils/baseModel";
import type { DB_Timestamps } from "../types";
import QueryHandler from "./utils/queryHandler";
import { TableNames } from "./utils/types";

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
    category: z.nativeEnum(E_ArticleCategory),
    publish_date: z.string().datetime(),
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
        super({ tableName: TableNames.ARTICLES, columns: [] });
    }

    public async createTable(): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS ${TableNames.ARTICLES} (
        id UUID PRIMARY KEY,
        title VARCHAR(${TITLE_MAX_LEN}) NOT NULL,
        description VARCHAR(${DESC_MAX_LEN}) NOT NULL,
        thumbnail VARCHAR(${THUMB_MAX_LEN}) NOT NULL,
        category ${ARTICLE_CATEGORY_NAME} NOT NULL DEFAULT '${E_ArticleCategory.TECH}',
        body JSONB NOT NULL,
        publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await QueryHandler.createEnumType(
            ARTICLE_CATEGORY_NAME,
            Object.values(E_ArticleCategory)
        );
        await QueryHandler.handleCommitQuery(query);
    }
}
