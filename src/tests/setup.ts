import { initDb } from "@/lib/db";
import type { Database } from "@/lib/db";

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Shared db instance — initialized once before all tests, reused across tests.
// Direct db access is used for test setup and verification (not hooks), so
// test setup stays decoupled from the code under test.
let db: Database;

export async function getDb(): Promise<Database> {
    if (!db) {
        db = await initDb();
    }
    return db;
}
