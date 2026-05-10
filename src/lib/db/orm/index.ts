// Public interface for the ORM layer.
// Call initORM(db) after initDb() resolves — runs pending migrations and wires the Drizzle instance.
// Future: initORM will call initDb() internally and become the single app entry point.

import type { Database, OrmInstance } from "@/lib/db/types";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createSqliteDriver, createSqlBatchDriver } from "./sql-driver";
import * as schema from "./schema";

import migration0 from "./migrations/0000_nappy_cable.sql";

const migrations = [{ version: 1, sql: migration0 }];

let _orm: OrmInstance;

let _db: Database | undefined;
export async function initORM(database: Database) {
    // TODO future: accept Promise<Database> (or call initDb() internally) so initORM is the single app entry point
    if (database.exec === undefined)
        throw new Error("SQLite Engine not initialised");

    const [row] = (await database.exec({
        sql: "PRAGMA user_version",
    })) as Array<{ user_version: number }>;
    let version: number = row?.user_version ?? 0;

    for (const m of migrations) {
        if (m.version > version) {
            await database.exec({ sql: m.sql });
            await database.exec({ sql: `PRAGMA user_version = ${m.version}` });
            version = m.version;
        }
    }

    _orm = drizzle(
        createSqliteDriver(database),
        createSqlBatchDriver(database),
        { schema },
    );
    _db = database;
    return;
}

export function getOrm() {
    if (!_orm) throw new Error("ORM not initialised — call initORM first");
    return _orm;
}

// Routes a same-schema insert of N rows through batchExec (prepare once, step N times)
// rather than a single multi-row VALUES statement.
// Drizzle's .toSQL() handles param serialization (column order, type coercion) so the
// SQL template stays in sync with the schema without manual mapping.
export async function bulkInsert<T extends Record<string, unknown>>(
    table: Parameters<ReturnType<typeof drizzle>["insert"]>[0],
    rows: T[],
): Promise<void> {
    if (rows.length === 0) return;

    if (!_orm || !_db)
        throw new Error("ORM not initialised — call initORM first");
    if (!_db.batchExec) throw new Error("Database not initialised");

    const { sql } = _orm.insert(table).values(rows[0]).toSQL();
    const paramSets = rows.map(
        (row) => _orm!.insert(table).values(row).toSQL().params as any[],
    );

    const result = await _db.batchExec(sql, paramSets);
    if (result.type === "error") throw new Error(result.message);
}
