import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export function validateDbEnv(): DbConfig {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  const missing: string[] = [];
  if (!user) missing.push("DB_USER");
  if (!password) missing.push("DB_PASSWORD");
  if (!database) missing.push("DB_NAME");

  if (missing.length > 0) {
    throw new Error(
      `[Database] Fatal: Missing required database environment variables: ${missing.join(
        ", "
      )}. Please configure them in your environment or .env file.`
    );
  }

  return {
    host,
    port,
    user: user as string,
    password,
    database: database as string,
  };
}

let poolInstance: Pool | null = null;

export function getPool(): Pool {
  if (!poolInstance) {
    const config = validateDbEnv();
    poolInstance = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 5,
      waitForConnections: true,
      queueLimit: 0,
      charset: "utf8mb4",
      enableKeepAlive: true,
      timezone: "Z",
    });
  }
  return poolInstance;
}

export type SqlParam = string | number | bigint | boolean | Date | Buffer | null;

export async function query<T extends RowDataPacket>(
  sql: string,
  params?: (SqlParam | undefined)[]
): Promise<T[]> {
  const pool = getPool();
  const sanitized = params ? params.map((p) => (p === undefined ? null : p)) : undefined;
  const [rows] = await pool.query<T[]>(sql, sanitized);
  return rows;
}

export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params?: (SqlParam | undefined)[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(
  sql: string,
  params?: (SqlParam | undefined)[]
): Promise<ResultSetHeader> {
  const pool = getPool();
  const sanitized = params ? params.map((p) => (p === undefined ? null : p)) : undefined;
  const [result] = await pool.execute<ResultSetHeader>(sql, sanitized);
  return result;
}

export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function checkDbHealth(): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.query("SELECT 1 AS health");
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}
