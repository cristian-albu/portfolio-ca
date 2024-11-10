import BaseModel, { SqlDataTypes } from "../../utils/baseModel";

export const tableName = "test_table";

export class TestModel extends BaseModel {
    constructor() {
        super({
            tableName: tableName,
            columns: [
                { column: "idCol", type: SqlDataTypes.UUID, primary_key: true },
                {
                    column: "id2Col",
                    type: SqlDataTypes.UUID,
                    primary_key: false,
                },
                { column: "varcharCol", type: SqlDataTypes.VARCHAR, max: 255 },
                {
                    column: "varchar2Col",
                    type: SqlDataTypes.VARCHAR,
                    max: 255,
                    notNull: true,
                },
                { column: "integerCol", type: SqlDataTypes.INTEGER },
                {
                    column: "integerCol2",
                    type: SqlDataTypes.INTEGER,
                    notNull: true,
                },
                {
                    column: "enumCol",
                    type: SqlDataTypes.ENUM,
                    enumName: "first_enum",
                    values: ["Something", "Otherthing"],
                },
                {
                    column: "enumCol2",
                    type: SqlDataTypes.ENUM,
                    enumName: "second_enum",
                    values: ["first", "second"],
                    default: "first",
                },
                { column: "jsonCol", type: SqlDataTypes.JSON },
                { column: "jsonCol2", type: SqlDataTypes.JSON, notNull: true },
                {
                    column: "timestampCol",
                    type: SqlDataTypes.TIMESTAMP,
                    default_now: true,
                },
                {
                    column: "timestampCol2",
                    type: SqlDataTypes.TIMESTAMP,
                    default_now: false,
                },
                { column: "boolCol", type: SqlDataTypes.BOOL, default: true },
                {
                    column: "boolCol2",
                    type: SqlDataTypes.BOOL,
                    default: false,
                    notNull: true,
                },
            ],
        });
    }
}

export const sqlTextMatch = `DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'first_enum') THEN
CREATE TYPE first_enum AS ENUM('Something', 'Otherthing');
END IF;
END $$;
DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'second_enum') THEN
CREATE TYPE second_enum AS ENUM('first', 'second');
END IF;
END $$;
CREATE TABLE IF NOT EXISTS test_table (
idCol uuid PRIMARY KEY,
id2Col uuid,
varcharCol VARCHAR(255),
varchar2Col VARCHAR(255) NOT NULL,
integerCol INTEGER,
integerCol2 INTEGER NOT NULL,
enumCol first_enum,
enumCol2 second_enum DEFAULT 'first',
jsonCol JSONB,
jsonCol2 JSONB NOT NULL,
timestampCol TIMESTAMP DEFAULT NOW(),
timestampCol2 TIMESTAMP,
boolCol BOOLEAN DEFAULT true,
boolCol2 BOOLEAN DEFAULT false NOT NULL
);`;

export const zodTextMatch = `import z from 'zod';
export const test_tableSchema = z.object({
idCol: z.string().uuid() || z.null(),
id2Col: z.string().uuid() || z.null(),
varcharCol: z.string().max(255) || z.null(),
varchar2Col: z.string().max(255),
integerCol: z.number() || z.null(),
integerCol2: z.number(),
enumCol: z.enum(["Something","Otherthing"]) || z.null(),
enumCol2: z.enum(["first","second"]).default("first") || z.null(),
jsonCol: z.string().refine(
(str) => {
try {
JSON.parse(str);
return true;
} catch {
return false;
}
},
{ message: "Body must be a valid JSON string" }
) || z.null(),
jsonCol2: z.string().refine(
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
timestampCol: z.string().datetime().default(() => new Date().toISOString()) || z.null(),
timestampCol2: z.string().datetime() || z.null(),
boolCol: z.boolean().default(true) || z.null(),
boolCol2: z.boolean().default(false)
});
export type Db_test_table = z.infer<typeof test_tableSchema>;`;
