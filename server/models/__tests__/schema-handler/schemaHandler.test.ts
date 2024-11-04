import { describe, expect, test } from "bun:test";
import { unlink } from "node:fs/promises";
import {
    sqlTextMatch,
    tableName,
    TestModel,
    zodTextMatch,
} from "../utils/data";

const basePath = "./server/models/__tests__/schema-handler";

describe("Init schema", async () => {
    const testModel = new TestModel();
    const sqlPath = `${basePath}/${tableName}.sql`;
    const zodPath = `${basePath}/${tableName}_zod.ts`;

    await testModel.initSchema(basePath);

    const [sqlText, zodText] = await Promise.all([
        Bun.file(sqlPath).text(),
        Bun.file(zodPath).text(),
    ]);

    test("sql schema", () => {
        expect(sqlText).toBe(sqlTextMatch);
        expect(sqlText).not.toBe("sanity check");
    });

    test("zod schema", () => {
        expect(zodText).toBe(zodTextMatch);
        expect(zodText).not.toBe("sanity check");
    });

    await Promise.all([unlink(sqlPath), unlink(zodPath)]);
});
