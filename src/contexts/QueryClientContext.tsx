'use client'
import { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { initDb, type Database } from "@/lib/db";
import { formatToIsoString } from '@/helpers';
import { mockTransactions } from '@/data';
import { Transaction } from '@/types';

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
    db: Database;
    invalidations: Invalidations;
    invalidate: (key: string) => void;
    errorDb: Error | null
} | null>(null);

interface Props {
    children: React.ReactNode;
}

let isPopulating = false;

async function populateDb(db: Database) {
    if (db.conn !== "opfs") throw new Error("Error populating database: wrong state: " + db.conn);
    if (!db.batchExec || !db.exec) throw new Error("Error populating database: wrong setup");

    // Check lock first
    if (isPopulating) {
        console.log("Already populating, skipping");
        return Promise.resolve();
    }

    isPopulating = true;  // ← Set lock

    try {
        const result = await db.exec({ sql: 'SELECT * FROM transactions LIMIT 1' }) as Transaction[];

        if (result.length > 0) {
            console.log("Transactions DB already created / skip populating");
            return Promise.resolve();
        }

        console.log("Populating database with mock data...");
        return db.batchExec(
            `INSERT INTO transactions (date, description, categoryId, amount) VALUES (?,?,?,?)`,
            mockTransactions.map(t => [
                formatToIsoString(t.date),
                t.description,
                t.categoryId,
                t.amount
            ])
        );
    } finally {
        isPopulating = false;  // ← Release lock
    }
}

export function QueryClientProvider({ children }: Props) {
    const [invalidations, setInvalidations] = useState<Invalidations>({});
    const [db, setDb] = useState<Database>({ conn: "loading", exec: undefined, batchExec: undefined })
    const [errorDb, setErrorDb] = useState<Error | null>(null);

    const invalidate = useCallback((key: string) => {
        setInvalidations(prev => ({
            ...prev,
            [key]: (prev[key] || 0) + 1,
        }))
    }, [])

    // Init Database
    useEffect(() => {
        initDb()
            .then((db) => {
                // TODO Remove DB populating from dataset when CSV import is ready
                return populateDb(db).then(() => db);

            })
            .then(db => {
                // Now Database object is ready to use
                setDb(db)
            })
            .catch((err) => {
                console.error('Error initialising database ', err);
                setErrorDb(err);
            });
    }, [])

    useEffect(() => {
        // Expose db to console for debugging (dev only)
        if (process.env.NODE_ENV === 'development') {
            (window as any).__db = db;
            console.log('Database exposed as window.__db for debugging');
        }
    }, [db]);

    // Memoize context value to prevent unnecessary re-renders of consumers
    // Only updates when actual values change:
    // - db: changes on reconnection
    // - invalidations: changes when invalidate() is called
    // - invalidate: stable (useCallback with empty deps)
    // - errorDb: changes on error
    const value = useMemo(() => ({
        db, invalidations, invalidate, errorDb
    }), [db, invalidations, invalidate, errorDb]);

    return (
        <QueryClientContext.Provider value={value} >
            {children}
        </QueryClientContext.Provider>
    );
}


export function useQueryClient() {
    const context = useContext(QueryClientContext);
    if (context === null) {
        throw new Error('useQueryClient must be used within a QueryClientContext');
    }
    return context;
}