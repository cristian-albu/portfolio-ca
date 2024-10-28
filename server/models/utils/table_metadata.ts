import type { TableMetadata } from "./types";

export enum TableNames {
    SKILLS = "skills",
    ARTICLES = "articles",
    UPDATES = "updates",
    EXPERIENCE = "experience",
    SERVICES = "services",
    PROJECTS = "projects",
    CASE_STUDIES = "case_studies",
    DOCUMENTS = "documents",
}

export enum SqlDataTypes {
    VARCHAR = "varchar",
    INTEGER = "integer",
    BOOL = "bool",
    UUID = "uuid",
    TIMESTAMP = "timestamp",
    ENUM = "enum",
    JSON = "json",
}

const TABLES_METADATA: Record<TableNames, TableMetadata> = {
    skills: {
        tableName: TableNames.SKILLS,
        columns: [
            {
                column: "",
                primary_key: true,
                type: SqlDataTypes.UUID,
            },
        ],
    },
    articles: {
        tableName: TableNames.ARTICLES,
        columns: [],
    },
    updates: {
        tableName: TableNames.UPDATES,
        columns: [],
    },
    experience: {
        tableName: TableNames.EXPERIENCE,
        columns: [],
    },
    services: {
        tableName: TableNames.ARTICLES,
        columns: [],
    },
    projects: {
        tableName: TableNames.PROJECTS,
        columns: [],
    },
    case_studies: {
        tableName: TableNames.CASE_STUDIES,
        columns: [],
    },
    documents: {
        tableName: TableNames.DOCUMENTS,
        columns: [],
    },
} as const;
