import type { ExecOptions } from "@sqlite.org/sqlite-wasm";

export type ExecArgument = Pick<ExecOptions, "bind" | "sql">;
export type Messages =
    | { type: "OpfsDb_not_found" }
    | { type: "OpfsDb_found" }
    | { type: "TRANSFER_PORT" }
    | { type: "LOAD" }
    | { type: "EXEC"; exec: ExecArgument }
    | { type: "BATCH_EXEC"; sql: string; paramSets: any[] };

export type BidirectionalFunction = (input: ExecArgument) => Promise<object>;
export type BidirectionalBatchResponse =
    | { type: "success" }
    | { type: "error"; message: string };

export type BidirectionalBatch = (sql: string, paramSets: any[][]) => Promise<BidirectionalBatchResponse>;

export type Database = {
    conn: "local" | "opfs" | "loading" | "error";
    exec: BidirectionalFunction | undefined,
    batchExec: BidirectionalBatch | undefined;
}
