import {
    ExecArgument,
    Messages,
    BidirectionalFunction,
    BidirectionalBatch,
    Database,
    BidirectionalBatchResponse,
} from "./types";

/**
 * Initialize Web Worker and detect OPFS (Origin-Private File System) support
 * Returns undefined if OPFS is not available in the browser
 */
function setupWorker() {
    return new Promise<Worker | undefined>((res) => {
        const url = new URL("./db.worker.ts", import.meta.url);
        const worker = new Worker(url, { type: "module" });
        worker.onerror = (e) =>
            console.error("Worker onerror:", e.message, e.filename, e.lineno);

        worker.onmessage = (e) => {
            const message: Messages = e.data;
            if (message.type === "OpfsDb_not_found") {
                res(undefined);
            }
            if (message.type === "OpfsDb_found") {
                res(worker);
            }
        };
    });
}

/**
 * Set up bidirectional communication with worker using MessageChannel
 *
 * MessageChannel enables request-response pattern with workers:
 * - Main thread sends query via port1
 * - Worker receives and processes via port2
 * - Worker sends results back through same channel
 *
 * This is necessary because workers can only postMessage (fire-and-forget),
 * they cannot directly return values like regular async functions.
 */
function setUpBidirectional(worker: Worker): {
    bidirectional: BidirectionalFunction;
    bidirectionalBatch: BidirectionalBatch;
} {
    const channel = new MessageChannel();
    let requestId = 0;
    const pendingPromises = new Map<
        number,
        { resolve: (value: any) => void; reject: (reason: any) => void }
    >();

    channel.port1.onmessage = (event: MessageEvent) => {
        const message = event.data;

        if (
            message.type === "EXEC_RESPONSE" ||
            message.type === "BATCH_RESPONSE"
        ) {
            const pending = pendingPromises.get(message.id);
            if (pending) {
                pending.resolve(message.data);
                pendingPromises.delete(message.id);
            }
        }

        if (message.type === "ERROR") {
            const pending = pendingPromises.get(message.id);
            if (pending) {
                pending.reject(
                    new Error(message.data?.error ?? "Unknown error"),
                );
                pendingPromises.delete(message.id);
            }
        }
    };

    worker.postMessage(
        {
            type: "TRANSFER_PORT",
        } as Messages,
        [channel.port2],
    );

    async function bidirectional(exec: ExecArgument) {
        const id = requestId++;

        const promise = new Promise<unknown[]>((resolve, reject) => {
            pendingPromises.set(id, { resolve, reject });
        });

        channel.port1.postMessage({ type: "EXEC", id, exec } as Messages);

        return promise;
    }

    async function bidirectionalBatch(sql: string, paramSets: any[][]) {
        const id = requestId++;

        const promise = new Promise<BidirectionalBatchResponse>(
            (resolve, reject) => {
                pendingPromises.set(id, { resolve, reject });
            },
        );

        channel.port1.postMessage({
            type: "BATCH_EXEC",
            id,
            sql,
            paramSets,
        } as Messages);

        return promise;
    }

    return {
        bidirectional,
        bidirectionalBatch,
    };
}

// Singleton pattern: Only one database connection across the application
let db: Database = { conn: "loading", exec: undefined, batchExec: undefined };
let initPromise: Promise<Database> | null = null;

/** Returns current db state synchronously. Check `db.conn` before using `exec`. */
export function getDbSync(): Database {
    return db;
}

/**
 * Initialize SQLite database connection
 *
 * Uses singleton pattern to ensure only one connection is created.
 * Prevents concurrent initialization attempts by caching the promise.
 */
export async function initDb(): Promise<Database> {
    if (db.conn !== "loading") {
        // Already initialized - return cached instance
        return db;
    }

    // Currently initializing - return same promise to prevent concurrent initialization
    if (initPromise) {
        return initPromise;
    }

    // Start initialization (return promise to avoid concurrent call)
    initPromise = (async () => {
        const worker = await setupWorker();
        let execWorker: BidirectionalFunction;
        let execBatchWorker: BidirectionalBatch;

        if (worker) {
            const setupResult = setUpBidirectional(worker);
            execWorker = setupResult.bidirectional;
            execBatchWorker = setupResult.bidirectionalBatch;
        } else {
            // TODO handle local if no OPFS
            console.warn("DB Worker not created (OPFS not found)");
            return { conn: "local", exec: undefined, batchExec: undefined };
        }

        db = {
            conn: worker ? "opfs" : "local",
            exec: execWorker,
            batchExec: execBatchWorker,
        };

        return db;
    })();

    return initPromise;
}
