import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mysql, { RowDataPacket } from "mysql2/promise";
import { getPool, query, queryOne, withTransaction, closePool, validateDbEnv } from "./pool";

interface MigrationRow extends RowDataPacket {
  version: number;
}

interface LockRow extends RowDataPacket {
  acquired: number | null;
}

interface AdminCountRow extends RowDataPacket {
  count: number;
}

export function resolveMigrationsDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "server", "migrations"),
    path.resolve(process.cwd(), "migrations"),
    path.resolve(__dirname, "../../migrations"),
    path.resolve(__dirname, "../migrations"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `[Database] Fatal: Unable to locate migrations directory in any of: ${candidates.join(
      ", "
    )}`
  );
}

export function parseSqlStatements(sql: string): string[] {
  const cleanSql = sql
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("--");
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join("\n");

  return cleanSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function seedAdminUserIfEmpty(): Promise<void> {
  const row = await queryOne<AdminCountRow>(
    "SELECT COUNT(*) AS count FROM admin_users"
  );
  const count = row ? Number(row.count) : 0;

  if (count === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const email = process.env.ADMIN_EMAIL || "admin@pehlwankarahi.com";
    const rawPassword = process.env.ADMIN_PASSWORD;

    if (!rawPassword || rawPassword.trim() === "") {
      throw new Error(
        "[Database] Fatal: ADMIN_PASSWORD environment variable is missing. It is required to seed the initial admin account."
      );
    }

    const passwordHash = await bcrypt.hash(rawPassword.trim(), 10);

    await query(
      `INSERT INTO admin_users (username, email, password_hash, name, role, token_version)
       VALUES (?, ?, ?, ?, 'superadmin', 0)`,
      [username, email, passwordHash, "Master Pehlwan"]
    );

    console.log(
      `[Database] Seeded initial admin account (username: ${username}, email: ${email}).`
    );
  }
}

export async function runMigrations(): Promise<void> {
  const pool = getPool();
  console.log("[Database] Checking schema migrations...");

  // 1. Acquire advisory lock
  const lockResult = await queryOne<LockRow>(
    "SELECT GET_LOCK('pk_migrate', 30) AS acquired"
  );
  if (!lockResult || lockResult.acquired !== 1) {
    throw new Error(
      "[Database] Could not acquire migration lock 'pk_migrate' within 30 seconds."
    );
  }

  try {
    // 2. Ensure schema_migrations table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Get applied migrations
    const appliedRows = await query<MigrationRow>(
      "SELECT version FROM schema_migrations ORDER BY version ASC"
    );
    const appliedSet = new Set(appliedRows.map((r) => r.version));

    // 4. Find all .sql files in migrations dir
    const migrationsDir = resolveMigrationsDir();
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const file of files) {
      const match = file.match(/^(\d+)_/);
      if (!match) continue;
      const version = parseInt(match[1], 10);

      if (!appliedSet.has(version)) {
        console.log(`[Database] Applying migration ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sqlContent = fs.readFileSync(filePath, "utf8");
        const statements = parseSqlStatements(sqlContent);

        await withTransaction(async (conn) => {
          for (const statement of statements) {
            await conn.query(statement);
          }
          await conn.query(
            "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
            [version, file]
          );
        });

        console.log(`[Database] Successfully applied migration ${file}.`);
      }
    }

    // 5. Seed initial admin user if table is empty
    await seedAdminUserIfEmpty();

    console.log("[Database] Schema migrations are up to date.");
  } finally {
    // Release lock
    await query("SELECT RELEASE_LOCK('pk_migrate')");
  }
}

export async function testMigrationsOnEmptyDatabase(customDbName?: string): Promise<void> {
  const config = validateDbEnv();
  const testDb =
    customDbName ||
    `pk_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  console.log(`[Database] Running startup migration test on empty database '${testDb}'...`);

  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      multipleStatements: true,
    });
  } catch (err) {
    console.warn(
      "[Database] Could not establish connection for startup migration test:",
      err instanceof Error ? err.message : err
    );
    return;
  }

  try {
    try {
      await conn.query(`DROP DATABASE IF EXISTS \`${testDb}\``);
      await conn.query(`CREATE DATABASE \`${testDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    } catch (err: unknown) {
      const dbErr = err as { code?: string; errno?: number; message?: string };
      if (
        dbErr.code === "ER_DBACCESS_DENIED_ERROR" ||
        dbErr.errno === 1044 ||
        dbErr.code === "ER_ACCESS_DENIED_ERROR" ||
        dbErr.errno === 1045
      ) {
        console.warn(
          `[Database] Notice: Current database user lacks CREATE DATABASE privileges. Skipping empty database migration test.`
        );
        return;
      }
      throw err;
    }

    await conn.query(`USE \`${testDb}\``);

    // Create schema_migrations table
    await conn.query(`
      CREATE TABLE schema_migrations (
        version INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const migrationsDir = resolveMigrationsDir();
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const file of files) {
      const match = file.match(/^(\d+)_/);
      if (!match) continue;
      const version = parseInt(match[1], 10);

      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf8");
      const statements = parseSqlStatements(sqlContent);

      for (const statement of statements) {
        await conn.query(statement);
      }

      await conn.query(
        "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
        [version, file]
      );
    }

    console.log(
      `[Database] Startup migration test PASSED: all ${files.length} migrations applied cleanly to empty database.`
    );
  } catch (err: unknown) {
    console.error(
      "[Database] FATAL: Startup migration test on empty database FAILED!",
      err instanceof Error ? err.message : err
    );
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.query(`DROP DATABASE IF EXISTS \`${testDb}\``);
      } catch {
        // ignore drop error on cleanup
      }
      await conn.end();
    }
  }
}

// Allow standalone CLI execution: `tsx server/src/db/migrate.ts`
if (require.main === module) {
  dotenv.config();
  const serverEnv = path.resolve(process.cwd(), "server", ".env");
  if (fs.existsSync(serverEnv)) {
    dotenv.config({ path: serverEnv });
  }

  const isTestEmpty = process.argv.includes("--test-empty");

  const action = isTestEmpty
    ? testMigrationsOnEmptyDatabase()
    : runMigrations();

  action
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch((err: unknown) => {
      console.error("[Database] Migration error:", err);
      process.exit(1);
    });
}
