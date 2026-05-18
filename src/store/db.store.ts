import { create } from "zustand";
import {
    initDb as initializeSQLDatabse,
    initORM as initializeORM,
    getOrm,
    OrmInstance,
} from "@/lib/db";
import { useEffect } from "react";

type Invalidations = Record<string, number>;

interface DbState {
    // State
    orm: OrmInstance | undefined;
    invalidations: Invalidations;
    errorDb: Error | null;

    // Actions
    initDb: () => Promise<void>;
    closeDb: () => Promise<void>;
    invalidate: (key?: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Module-level singleton

const useDbStoreRaw = create<DbState>()((set, get) => ({
    // ── Initial state ──────────────────────────────────────────────────────
    orm: (() => {
        try {
            return getOrm();
        } catch {
            return undefined;
        }
    })(),
    invalidations: {},
    errorDb: null,

    // ── Actions ────────────────────────────────────────────────────────────

    initDb: async () => {
        const { orm } = get();
        try {
            if (!orm) {
                const db = await initializeSQLDatabse();
                await initializeORM(db);
                const newOrm = getOrm();
                set({ orm: newOrm, errorDb: null });

                if (process.env.NODE_ENV === "development") {
                    // Expose orm to console for debugging (dev only)
                    (window as typeof window & { __orm: OrmInstance }).__orm =
                        newOrm;
                }
            }
        } catch (error) {
            const _error =
                error instanceof Error ? error : Error(error as string);
            console.error(_error.message);
            set({ errorDb: _error });
        }
    },

    // TODO BAB-50 (Concepts 2, 3): async. Use get() to read current orm before acting.
    // Steps: if no orm, return early. closeDatabase(), set({ orm: undefined }),
    // then bump every invalidation counter so active queries re-run.
    closeDb: async () => {},

    // invalidate key to trigger re-render of consumer when database it mutated
    // Note: support invalidation one key or all if not key are given as props
    invalidate: (key?: string) => {
        set((state) => {
            if (key === undefined) {
                // invalidate all keys
                return {
                    invalidations: Object.fromEntries(
                        Object.keys(state.invalidations).map((k) => [
                            k,
                            (state.invalidations[k] || 0) + 1,
                        ]),
                    ),
                };
            } else {
                return {
                    invalidations: {
                        ...state.invalidations,
                        [key]: (state.invalidations[key] || 0) + 1,
                    },
                };
            }
        });
    },
}));

// Wrap store in custom hook to ensure `initDb()` is called lazy
// Note: assuming initDb internal initialisation (actual `initDb` and `initOrm` is safe to conncurent access)
// TODO BAB-50 only done once on mount. later when storage clear feature implemented, will need to re-init somehow
export const useDbStore = <T>(selector: (s: DbState) => T) => {
    const store = useDbStoreRaw(selector);

    useEffect(() => {
        useDbStoreRaw.getState().initDb();
    }, []);

    return store;
};
