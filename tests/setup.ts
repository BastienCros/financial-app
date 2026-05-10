import { initDb, initORM, getOrm } from "@/lib/db";
import type { Database, OrmInstance } from "@/lib/db";

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Shared db instance — initialized once before all tests, reused across tests.
// Direct db access is used for test setup and verification (not hooks), so
// test setup stays decoupled from the code under test.
let db: Database;
let orm: OrmInstance;

export async function getDb(): Promise<Database> {
    if (!db) {
        db = await initDb();
    }
    return db;
}

export async function getOrmObject(): Promise<OrmInstance> {
    if (!db) {
        db = await initDb();
    }
    if (!orm) {
        await initORM(db);
        orm = getOrm();
    }
    return orm;
}
