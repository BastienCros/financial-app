import { useEffect, useState, useCallback } from "react";
import { BindingSpec } from "@sqlite.org/sqlite-wasm";
import { useQueryClient } from "@/contexts";

/**
 * Generic SQL query hook with invalidation support
 *
 * Invalidation System:
 * - Each table has a `key` (e.g., "transactions")
 * - When table change (via mutation), call `invalidate(key)`
 * - This increments the counter for that key
 * - All queries watching that key automatically re-run
 *
 * Re-render Behavior:
 * - Primitives (strings, numbers) in dependencies are compared by VALUE
 * - Parent re-renders won't trigger re-query if `query` string and `argsKey` values are unchanged
 * - `db` object is memoized in context, only changes on reconnection
 */
export function useQuery<T>(
    key: string,
    query: string,
    args: BindingSpec | undefined = undefined
) {
    const { db, invalidations } = useQueryClient();
    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const invalidationKey = invalidations[key];
    // Serialize args to compare by content, not array reference
    // Prevents infinite loops from new array creation on each render
    const argsKey = JSON.stringify(args);

    useEffect(() => {
        const runQuery = async () => {
            if (!db.exec || db.conn === "loading") {
                return;  // ← Skip query until db ready
            }
            setLoading(true);
            try {
                const result = await db.exec({
                    sql: query,
                    bind: args
                });
                // Type assertion - caller must ensure T matches SQL result shape
                setData(result as T);
            } catch (error) {
                console.error(`Error running query`, error);
                // TODO Handling error in db: currently exec does not handle error
                setError("Error running query " + JSON.stringify(error));
            } finally {
                setLoading(false);
            }
        }

        runQuery()

        // Serialize args to avoid ref comparison causing infinite loops
        // Disable exhaustive-deps since we intentionally use 'args' but track 'argsKey'
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, invalidationKey, db, query, argsKey])

    return { data, loading, error }
}

/**
 * Generic SQL mutation hook (INSERT/UPDATE/DELETE)
 *
 * Uses batchExec for all mutations to get:
 * - Transaction wrapping (atomicity)
 * - Error handling with rollback
 * - Single item: pass array with one element
 * - Multiple items: pass array of items
 *
 * toBindParams pattern:
 * - Must be memoized with useCallback in domain hooks
 * - Prevents mutate function recreation on every render
 */
export function useMutation<T>(
    key: string,
    query: string,
    toBindParams: (data: T) => Array<unknown>,
) {
    const { db, invalidate } = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const mutate = useCallback(async (data: T[]) => {
        if (!db.batchExec || db.conn === "loading") {
            throw new Error("DB not ready");
        }

        setLoading(true);
        try {
            // TODO proper type for batchExec return
            const result = await db.batchExec(
                query,
                data.map(d => toBindParams(d))
            )

            if (result.type === "error") {
                setError(result.message);
            } else {
                // Else successfull insert: nothing to do
                invalidate(key);
            }

        } catch (error) {
            console.log(`Error running query`, error);
            // TODO Handling error in db: currently exec does not handle error
            setError("Error running query " + JSON.stringify(error));
        } finally {
            setLoading(false);
        }


    }, [key, query, toBindParams, db, invalidate]);

    return { mutate, loading, error }
}