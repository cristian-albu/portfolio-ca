import { Pool } from "pg";

const pgPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MILLIS),
});

if (pgPool) {
  console.log(
    `Connected to ${pgPool.options.database} database. Current connections: ${pgPool.totalCount}. Idle connection: ${pgPool.idleCount}`
  );
}

pgPool.on("connect", (client) => {
  console.log(`A new client has been connected. ${JSON.stringify(client)}`);
});

pgPool.on("error", (err) => {
  console.error(`Unexpected error on idle client`, err);
});

export default pgPool;
