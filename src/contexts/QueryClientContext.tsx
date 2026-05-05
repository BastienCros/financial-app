"use client";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useMemo,
} from "react";
import { initDb, initORM, getOrm, bulkInsert, OrmInstance } from "@/lib/db";
import { transactions as transactionsTable } from "@/lib/db/orm/schema";
import { formatToIsoString } from "@/helpers";
import { mockTransactions } from "@/data";

/**
 * Invalidation System:
 *
 * Query invalidations are tracked via counters per key (e.g., "transactions").
 * When data changes (mutation), call invalidate(key) to increment the counter.
 * All useQuery hooks watching that key see the counter change and re-run their queries.
 *
 * This ensures UI updates after mutations without prop drilling or manual refetching.
 */
type Invalidations = Record<string, number>;

const QueryClientContext = createContext<{
    orm: OrmInstance;
    invalidations: Invalidations;
    invalidate: (key: string) => void;
    errorDb: Error | null;
} | null>(null);

interface Props {
    children: React.ReactNode;
}

let isPopulating = false;

// TODO Intentionally runs in production: no CSV import yet (BAB-11), so mock data is the only
// way to seed the DB. Once CSV import is live, this moves to dev-only.
async function populateDb() {
    if (isPopulating) {
        console.log("Already populating, skipping");
        return;
    }

    isPopulating = true;

    try {
        const existing = await getOrm()
            .select()
            .from(transactionsTable)
            .limit(1);

        if (existing.length > 0) {
            console.log("Transactions DB already created / skip populating");
            return;
        }

        console.log("Populating database with mock data...");
        await bulkInsert(
            transactionsTable,
            mockTransactions.map(
                ({ date, description, categoryId, amount }) => ({
                    date: formatToIsoString(date),
                    description,
                    categoryId,
                    amount,
                }),
            ),
        );
    } finally {
        isPopulating = false;
    }
}

export function QueryClientProvider({ children }: Props) {
    const [invalidations, setInvalidations] = useState<Invalidations>({});
    const [orm, setOrm] = useState<OrmInstance>(undefined);
    const [errorDb, setErrorDb] = useState<Error | null>(null);

    const invalidate = useCallback((key: string) => {
        setInvalidations((prev) => ({
            ...prev,
            [key]: (prev[key] || 0) + 1,
        }));
    }, []);

    // Init Database
    useEffect(() => {
        const init = async () => {
            try {
                const db = await initDb();
                await initORM(db);
                // TODO Remove DB populating from dataset when CSV import is ready
                await populateDb();
                setOrm(getOrm());
            } catch (err) {
                console.error("Error initialising database ", err);
                setErrorDb(err as Error);
            }
        };
        init();
    }, []);

    useEffect(() => {
        // Expose orm to console for debugging (dev only)
        if (process.env.NODE_ENV === "development") {
            (window as any).__orm = orm;
            console.log("ORM exposed as window.__orm for debugging");
        }
    }, [orm]);

    // Memoize context value to prevent unnecessary re-renders of consumers
    // Only updates when actual values change:
    // - orm: changes once init completes
    // - invalidations: changes when invalidate() is called
    // - invalidate: stable (useCallback with empty deps)
    // - errorDb: changes on error
    const value = useMemo(
        () => ({
            orm,
            invalidations,
            invalidate,
            errorDb,
        }),
        [orm, invalidations, invalidate, errorDb],
    );

    return (
        <QueryClientContext.Provider value={value}>
            {children}
        </QueryClientContext.Provider>
    );
}

export function useQueryClient() {
    const context = useContext(QueryClientContext);
    if (context === null) {
        throw new Error(
            "useQueryClient must be used within a QueryClientContext",
        );
    }
    return context;
}
