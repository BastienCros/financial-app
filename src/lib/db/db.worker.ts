
import sql from '@sqlite.org/sqlite-wasm';
import {
    Messages,
    ExecArgument,
    BidirectionalBatchResponse,
} from './types';
import Error from 'next/error';

async function main() {
    const con = await sql();


    if (!("OpfsDb" in con.oo1)) {
        // TODO fallback if OPFS not available
        postMessage({ type: "OpfsDb_not_found" } as Messages);
        return;
    }
    // postMessage({ type: "OpfsDb_found" } as Messages);

    // Create database in Origin-Private File System (OPFS)
    const db = new con.oo1.OpfsDb("/main.db", "c");

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

        return result as any as object;
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
                    e.ports[0].postMessage(response);
                } catch (err: unknown) {
                    const message = (err as any)?.message ?? String(err);
                    e.ports[0].postMessage({ type: "error", error: message });
                }
            }

            if (data.type === "BATCH_EXEC") {
                let response: BidirectionalBatchResponse;
                // Transaction wrapping for atomicity: all succeed or all fail
                db.exec("BEGIN");
                const stmt = db.prepare(data.sql);
                try {
                    for (const params of data.paramSets) {
                        stmt.bind(params);
                        stmt.step();
                        stmt.reset();
                    }
                    response = { type: "success" }

                } catch (err: unknown) {
                    // Rollback on error - undo all inserts in this batch
                    db.exec("ROLLBACK");
                    response = { type: "error", message: String(err) }

                } finally {
                    stmt.finalize();
                    db.exec("COMMIT");
                }
                e.ports[0].postMessage(response)
            }
        };
    });


    postMessage({ type: "OpfsDb_found" } as Messages);
}

main();