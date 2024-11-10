import { describe, expect, mock, spyOn, test } from "bun:test";
import { tableName, TestModel } from "../utils/data";
import QueryHandler from "../../utils/queryHandler";

const mock_queryResult = {
    rowCount: 0,
    rows: [],
    oid: 1,
    command: "",
    fields: [],
};

describe("model", async () => {
    const model = new TestModel();

    const handleReadQuerySpy = spyOn(QueryHandler, "handleReadQuery");
    handleReadQuerySpy.mockImplementation(() =>
        Promise.resolve(mock_queryResult)
    );

    const handleCommitQuerySpy = spyOn(QueryHandler, "handleCommitQuery");
    handleCommitQuerySpy.mockImplementation(() =>
        Promise.resolve(mock_queryResult)
    );

    test("findAll", async () => {
        await model.findAll();

        expect(handleReadQuerySpy).toHaveBeenCalledWith(
            `SELECT * FROM ${tableName};`
        );
    });

    test("findById", async () => {
        await model.findById("id");

        expect(handleReadQuerySpy).toHaveBeenCalledWith(
            `SELECT * FROM ${tableName} WHERE id=$1 LIMIT 1;`,
            ["id"]
        );
    });

    test("createOne", async () => {
        await model.createOne({ id: "something", number: 1, someBool: true });

        expect(handleCommitQuerySpy).toHaveBeenCalledWith(
            `INSERT INTO ${tableName} (id,number,someBool) VALUES ($1,$2,$3) RETURNING *;`,
            ["something", 1, "true"]
        );
    });

    test("updateById", async () => {
        await model.updateById("id", {
            id: "something",
            number: 1,
            someBool: true,
        });

        expect(handleCommitQuerySpy).toHaveBeenCalledWith(
            `UPDATE ${tableName} SET id=$2, number=$3, someBool=$4 WHERE id=$1 RETURNING *;`,
            ["id", "something", 1, "true"]
        );
    });

    test("deleteById", async () => {
        await model.deleteById("id");

        expect(handleCommitQuerySpy).toHaveBeenCalledWith(
            `DELETE FROM ${tableName} WHERE id=$1;`,
            ["id"]
        );
    });

    test("deleteAll", async () => {
        await model.deleteAll();

        expect(handleCommitQuerySpy).toHaveBeenCalledWith(
            `DELETE FROM ${tableName};`
        );
    });
});
