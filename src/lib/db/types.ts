import type { ExecOptions } from "@sqlite.org/sqlite-wasm";
import { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./orm/schema";

export type ExecArgument = Pick<ExecOptions, "bind" | "sql" | "rowMode">;
export type Messages =
    | { type: "OpfsDb_not_found" }
    | { type: "OpfsDb_found" }
    | { type: "TRANSFER_PORT" }
    | { type: "LOAD" }
    | { type: "EXEC"; id: number; exec: ExecArgument }
    | { type: "EXEC_RESPONSE"; id: number; data: any }
    | { type: "BATCH_EXEC"; id: number; sql: string; paramSets: any[] }
    | { type: "BATCH_RESPONSE"; id: number; data: BidirectionalBatchResponse }
    | { type: "ERROR"; id: number; data: { type: "error"; error: string } };

export type BidirectionalFunction = (input: ExecArgument) => Promise<unknown[]>;
export type BidirectionalBatchResponse =
    | { type: "success" }
    | { type: "error"; message: string };

export type BidirectionalBatch = (
    sql: string,
    paramSets: any[][],
) => Promise<BidirectionalBatchResponse>;

export type Database = {
    conn: "local" | "opfs" | "loading" | "error";
    exec: BidirectionalFunction | undefined;
    batchExec: BidirectionalBatch | undefined;
};

export type OrmInstance = SqliteRemoteDatabase<typeof schema> | undefined;
