import pgPool from "../../lib/pgPool";
import type { PoolClient } from "pg";
import type { TableNames } from "./baseModel";

export default abstract class QueryHandler {
    static async handleReadQuery(query: string, args?: (string | number)[]) {
        const client = await pgPool.connect();

        try {
            const result = await client.query(query, args ? [...args] : []);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error("Database read operation failed");
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
            console.error(error);
            throw error;
        } finally {
            client.release();
        }
    }

    private static async createJsonTableBackup(
        tableName: TableNames,
        client: PoolClient,
        path = "./server/models/backups"
    ) {
        try {
            const data = await client.query(`SELECT * FROM ${tableName};`);

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filePath = `${path}/${tableName}_backup_${timestamp}.json`;

            await Bun.write(filePath, JSON.stringify(data.rows, null, 2));

            console.log(
                `Backup for table '${tableName}' created at ${filePath}`
            );

            return filePath;
        } catch (error) {
            console.error(
                `Error creating backup for table ${tableName}`,
                error
            );
            throw new Error(`Failed to create backup for table ${tableName}`);
        }
    }

    static async createTablesBackup(tableNames: TableNames[]) {
        const client = await pgPool.connect();

        try {
            const backupPaths: string[] = [];
            for (const tableName of tableNames) {
                const backupPath = await this.createJsonTableBackup(
                    tableName,
                    client
                );
                backupPaths.push(backupPath);
            }

            return backupPaths;
        } catch (error) {
            console.error("Error creating backups", error);
            throw new Error("Error creating backups");
        } finally {
            client.release();
        }
    }
}
