import { useEffect, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { OrmInstance } from "@/lib/db";
import { useDbStore } from "@/store/db.store";

export function useQuery<T>(
    key: string,
    queryFn: (orm: NonNullable<OrmInstance>) => Promise<T>,
    deps: unknown[] = [],
) {
    const { orm, invalidationKey } = useDbStore(
        useShallow((s) => ({
            orm: s.orm,
            invalidationKey: s.invalidations[key],
        })),
    );

    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!orm) return;
        const run = async () => {
            setLoading(true);
            try {
                setData(await queryFn(orm));
            } catch (e) {
                console.error("Error running query", e);
                setError("Error running query " + JSON.stringify(e));
            } finally {
                setLoading(false);
            }
        };
        run();
        // queryFn excluded — deps covers its closed-over values
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, invalidationKey, orm, ...deps]);

    return { data, loading, error };
}

export function useMutation<T>(
    key: string,
    mutateFn: (items: T[]) => Promise<void>,
) {
    const { orm, invalidate } = useDbStore(
        useShallow((s) => ({ orm: s.orm, invalidate: s.invalidate })),
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const mutate = useCallback(
        async (data: T[]) => {
            if (!orm) throw new Error("DB not ready");
            setLoading(true);
            try {
                await mutateFn(data);
                invalidate(key);
            } catch (e) {
                console.error("Error running mutation", e);
                setError("Error running mutation " + JSON.stringify(e));
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [key, mutateFn, orm, invalidate],
    );

    return { mutate, loading, error };
}
