import {
    ExecArgument,
    Messages,
    BidirectionalFunction,
    BidirectionalBatch,
    Database,
    BidirectionalBatchResponse,
} from './types';

/**
 * Initialize Web Worker and detect OPFS (Origin-Private File System) support
 * Returns undefined if OPFS is not available in the browser
 */
function setupWorker() {
    return new Promise<Worker | undefined>(res => {
        const worker = new Worker(new URL('./db.worker.ts', import.meta.url))

        worker.onmessage = (e) => {
            const message: Messages = e.data;
            if (message.type === "OpfsDb_not_found") {
                res(undefined);
            }
            if (message.type === "OpfsDb_found") {
                res(worker)
            }
        }
    })
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
    bidirectional: BidirectionalFunction,
    bidirectionalBatch: BidirectionalBatch
} {
    const channel = new MessageChannel();

    worker.postMessage(
        {
            type: "TRANSFER_PORT"
        } as Messages,
        [channel.port2]
    );

    async function bidirectional(exec: ExecArgument) {
        // TODO: Race condition - concurrent calls can overwrite onmessage handler and mismatch responses
        // Solution: Implement request ID correlation (id counter + pending promises map)
        // Priority: Low for POC - unlikely with current usage patterns (sequential queries)
        channel.port1.postMessage({ type: 'EXEC', exec } as Messages);

        const event = await new Promise<MessageEvent>(res => {
            channel.port1.onmessage = (event: MessageEvent) => {
                res(event);
            }
        })

        return event.data;
    }

    async function bidirectionalBatch(sql: string, paramSets: any[][]) {
        channel.port1.postMessage({ type: 'BATCH_EXEC', sql, paramSets } as Messages);

        const event = await new Promise<MessageEvent<BidirectionalBatchResponse>>(res => {
            channel.port1.onmessage = (event: MessageEvent) => {
                res(event);
            }
        })

        return event.data
    }

    return {
        bidirectional,
        bidirectionalBatch,
    };
}

// Singleton pattern: Only one database connection across the application
let db: Database = { conn: "loading", exec: undefined, batchExec: undefined };
let initPromise: Promise<Database> | null = null;

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
        }

        // TODO: Schema Separation
        // Currently creating transaction table in lib/db layer violates separation of concerns
        // Solution: Move schema definitions to application initialization or migration system
        // Keep lib/db generic and reusable across different applications
        db.exec?.({
            sql: `
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY,
            date TIMESTAMP,
            description TEXT NOT NULL,
            categoryId  TEXT NOT NULL,
            amount REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`
        })

        return db;
    })();

    return initPromise;
}