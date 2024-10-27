import type { TableNames } from "../../lib/tableNames";
import QueryHandler from "./queryHandler";

export default class BaseModel<T> {
  public tableName: TableNames;
  public async createTable() {}

  constructor({ tableName }: { tableName: TableNames }) {
    this.tableName = tableName;
  }

  public async findAll() {
    const result = await QueryHandler.handleReadQuery(`SELECT * FROM $1;`, [this.tableName]);
    return result.rows as T[];
  }

  public findOne() {}

  public createOne() {}

  public updateOne() {}

  public deleteOne() {}

  public deleteAll() {
    return QueryHandler.handleCommitQuery(`DELETE * FROM $1`, [this.tableName]);
  }
}
