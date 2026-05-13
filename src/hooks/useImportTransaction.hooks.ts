import React from "react";
import Papa, { ParseResult } from "papaparse";
import { csvToTransaction, ImportStatus } from "@/lib/csv";
import { useAddTransactions } from "@/hooks/transactions.hooks";

const useImportTransaction = () => {
    const [status, setStatus] = React.useState<ImportStatus>("idle");
    const { mutate } = useAddTransactions();

    // Let user reset status (no sure if ok to do this)
    const resetStatus = () => {
        if (status === "error" || status === "success") {
            setStatus("idle");
        }
    };

    const startProcessing = (file: File) => {
        setStatus("loading");

        const onComplete = async (
            result: ParseResult<Record<string, string>>,
        ) => {
            try {
                // TODO decide how to handle invalide format: reject invalid row or whole csv ?
                // Current decision: filter out row that generated error with parsing
                if (result.errors.length !== 0) {
                    const errorIndices = new Set(
                        result.errors.map((e) => e.row),
                    );
                    console.warn(
                        `Removing ${errorIndices.size} rows from CSV due to format error`,
                    );
                    result.data = result.data.filter(
                        (_, idx) => !errorIndices.has(idx),
                    );
                }

                // TODO decide how to handle invalide format: reject invalid row or whole csv ?
                // Current decision: invalidate row only: `csvToTransaction()` return `undefined` in this => filter out those row
                const newTransactions = result.data
                    .map(csvToTransaction)
                    .filter((x): x is NonNullable<typeof x> => x != null);

                if (newTransactions.length === 0) {
                    console.warn("No data extracted from CSV file");
                } else {
                    // Can start bulk import
                    await mutate(newTransactions);
                }

                setStatus("success");
            } catch (err) {
                console.error("File reading failed", err);
                setStatus("error");
            }
        };

        // Not sure this is used in Papaparse with Worker mode - keep in case we may not use worker
        const onError = (error: Error, file: File) =>
            console.error("Error", error, file);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: onComplete,
            error: onError,
            worker: true,
            // TODO default encoding hardcoded, later try to guess it (maybe lib like `jschardet`)
            encoding: "ISO-8859-1",
        });

        return;
    };

    return { status, resetStatus, startProcessing };
};

export default useImportTransaction;
