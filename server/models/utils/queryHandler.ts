import pgPool from "../../lib/pgPool";

export default abstract class QueryHandler {
  static async handleReadQuery(query: string, args?: (string | number)[]) {
    const client = await pgPool.connect();

    try {
      const result = await client.query(query, args ? [...args] : []);
      return result;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  static async handleCommitQuery(query: string, args?: (string | number)[]) {
    const client = await pgPool.connect();

    try {
      await client.query("BEGIN");
      const result = await client.query(query, args ? [...args] : []);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async createEnumType(enumName: string, values: string[]) {
    const checkEnumTypeQuery = `
          SELECT 1 
          FROM pg_type 
          WHERE typname = $1
        `;
    const result = await this.handleReadQuery(checkEnumTypeQuery, [enumName]);

    if (result.rowCount === 0) {
      const enumTypeDefinition = `
            CREATE TYPE ${enumName} AS ENUM(${values.map((value) => `'${value}'`).join(", ")});
          `;
      await this.handleCommitQuery(enumTypeDefinition);
    }
  }
}
