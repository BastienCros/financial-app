import { PreparedStatement } from "@sqlite.org/sqlite-wasm";

// Environment detection for conditional logging
const isDev = process.env.NODE_ENV === "development";
// Enable Debug only if in developpement mode
const SQL_DB_DEBUG = isDev && process.env.SQL_DB_DEBUG;

const SQL_DB_FLAGS: string = `c${SQL_DB_DEBUG ? "t" : ""}`;

(globalThis as any).sqlite3InitModuleState = {
    wasmFilename: "sqlite3.wasm",
    debugModule: isDev ? console.log : () => {},
};

import sqlModule, { Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { Messages, ExecArgument, BidirectionalBatchResponse } from "./types";

const debug = SQL_DB_DEBUG ? console.log : () => {};
const error = console.error;

async function start(sqlite3: Sqlite3Static) {
    debug("Running SQLite3 version", sqlite3.version.libVersion);
    const db =
        "opfs" in sqlite3
            ? new sqlite3.oo1.OpfsDb("/main.db", SQL_DB_FLAGS)
            : new sqlite3.oo1.DB("/main.db", SQL_DB_FLAGS);
    debug(
        "opfs" in sqlite3
            ? `OPFS is available, created persisted database at ${db.filename}`
            : `OPFS is not available, created transient database ${db.filename}`,
    );

    /**
     * Execute SQL query with object row mode
     * rowMode: "object" returns array of objects like [{id: 1, name: "..."}, ...]
     * This is the preferred format for TypeScript type safety
     */
    function fn(input: ExecArgument) {
        const result = db.exec({
            rowMode: "object",
            ...input,
        } as any);

        return result as object;
    }

    // Set up message handler for bidirectional communication via MessageChannel
    // MessageChannel is needed because worker can only postMessage (async), not return values
    addEventListener("message", async (e) => {
        const receiving = e.data as Messages;

        if (receiving.type !== "TRANSFER_PORT") {
            return;
        }

        // Handle bidirectional communication through transferred port
        e.ports[0].onmessage = function (event: MessageEvent) {
            const data = event.data as Messages;

            if (data.type === "EXEC") {
                try {
                    const response = fn(data.exec);
                    e.ports[0].postMessage({
                        type: "EXEC_RESPONSE",
                        id: data.id, // Echo back ID
                        data: response,
                    });
                } catch (err: unknown) {
                    const message = (err as Error)?.message ?? String(err);
                    e.ports[0].postMessage({
                        type: "error",
                        id: data.id,
                        data: { type: "error", error: message },
                    });
                }
            }

            if (data.type === "BATCH_EXEC") {
                let response: BidirectionalBatchResponse;
                // Transaction wrapping for atomicity: all succeed or all fail
                db.exec("BEGIN");

                debug("BEGIN BATCH_EXEC", data.sql);

                let stmt: PreparedStatement | null = null;

                try {
                    stmt = db.prepare(data.sql);

                    for (const params of data.paramSets) {
                        stmt.bind(params);
                        stmt.step();
                        stmt.reset();
                    }
                    db.exec("COMMIT");
                    response = { type: "success" };
                } catch (err: unknown) {
                    // Rollback on error - undo all inserts in this batch
                    db.exec("ROLLBACK");
                    response = { type: "error", message: String(err) };
                } finally {
                    if (stmt) {
                        stmt.finalize();
                    }
                }
                e.ports[0].postMessage({
                    type: "BATCH_RESPONSE",
                    id: data.id, // Echo back ID
                    data: response,
                });
            }
        };
    });

    postMessage({ type: "OpfsDb_found" } as Messages);
}

const initializeSQLite = async () => {
    try {
        // Check OPFS support
        debug("Checking OPFS support...");
        debug("Has navigator.storage?", !!navigator?.storage);
        debug("Has getDirectory?", !!navigator?.storage?.getDirectory);

        debug("Loading and initializing SQLite3 module...");
        const sqlite3 = await sqlModule({
            print: debug,
            printErr: error,
            locateFile: (path, prefix) => {
                debug("locateFile called with:", path, prefix);

                // Guard against undefined/null
                if (!path) return prefix;

                // Use dynamic base URL for production compatibility
                const getBaseUrl = () => {
                    if (typeof self !== "undefined" && self.location) {
                        return self.location.origin;
                    }
                    return "http://localhost:3000";
                };

                const baseUrl = getBaseUrl();

                if (path.endsWith("sqlite3.wasm")) {
                    return `${baseUrl}/sqlite`;
                }
                if (path.endsWith("sqlite3-opfs-async-proxy.js")) {
                    return `${baseUrl}/sqlite-proxy`;
                }
                return prefix + path;
            },
        });

        debug("SQLite3 initialized. Checking oo1...");
        debug("sqlite3.oo1:", sqlite3.oo1);
        start(sqlite3);
    } catch (err) {
        const message = (err as Error)?.message ?? String(err);
        const name = (err as Error)?.name ?? "Unknown";
        error("Initialization error:", name, message);
    }
};

initializeSQLite();
