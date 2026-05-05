// Bridges Drizzle's sqlite-proxy driver to the existing Database.exec.
// Drizzle calls the returned function with (sql, params, method).
// This forwards the call through the MessageChannel to the Web Worker.
//
// method meanings:
//   'run'    → INSERT / UPDATE / DELETE (no rows returned)
//   'get'    → SELECT expecting one row
//   'all'    → SELECT expecting array of rows  ← most common
//   'values' → SELECT returning raw value arrays (not objects)
import type {
    AsyncRemoteCallback,
    AsyncBatchRemoteCallback,
} from "drizzle-orm/sqlite-proxy";
import { Database } from "@/lib/db/types";

export function createSqliteDriver(database: Database): AsyncRemoteCallback {
    return async (sql, params, method) => {
        if (!database.exec) return { rows: [] };

        console.log(`[SQL Driver] Run '${method}' - SQL - '${sql}'`);

        try {
            const result = await database.exec({
                sql,
                bind: params as any,
                rowMode: "array",
            });
            if (method === "get") {
                return { rows: result[0] as string[] };
            }
            return { rows: result as string[][] };
        } catch (e: unknown) {
            throw new Error(
                `Driver exec failed: ${e instanceof Error ? e.message : String(e)}`,
            );
        }
    };
}

// Each query in the batch is independent — different SQL, different params.
// Maps to N separate exec calls (not batchExec which runs the same SQL N times).
export function createSqlBatchDriver(
    database: Database,
): AsyncBatchRemoteCallback {
    return async (batch) => {
        if (!database.exec) return batch.map(() => ({ rows: [] }));

        const exec = database.exec;
        return Promise.all(
            batch.map(async ({ sql, params, method }) => {
                console.log(`[SQL Driver] Batch '${method}' - SQL - '${sql}'`);
                try {
                    const result = await exec({
                        sql,
                        bind: params as any,
                        rowMode: "array",
                    });
                    if (method === "get") {
                        return { rows: result[0] as string[] };
                    }
                    return { rows: result as string[][] };
                } catch (e: unknown) {
                    throw new Error(
                        `Batch driver exec failed: ${e instanceof Error ? e.message : String(e)}`,
                    );
                }
            }),
        );
    };
}
