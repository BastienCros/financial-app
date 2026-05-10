import React from "react";

export type ImportStatus = "idle" | "loading" | "success" | "error";

const useImportTransaction = (file: File | undefined) => {
    const [status, setStatus] = React.useState<ImportStatus>("idle");

    React.useEffect(() => {
        if (!file) {
            setStatus("idle");
            return;
        }

        // Create a flag to prevent state updates if the file changes or component unmounts
        let active = true;
        const reader = new FileReader();

        // TODO dummy print file data for now, later use 'papaparse'
        const processFile = () => {
            setStatus("loading");

            // Success handler
            reader.onload = (e) => {
                if (!active) {
                    // active === false means the processing have been aborted somehow
                    // so early return and dont touch internal state as they may be handled by another processing (to be confirmed)
                    return;
                }

                try {
                    const text = e.target?.result as string;

                    // Simulating a heavy parsing task (e.g., PapaParse or custom logic)
                    const parsedData = text
                        .split("\n")
                        .map((row) => row.split(","));

                    // handle parsedData
                    console.log("parsedData", parsedData);
                    setStatus("success");
                } catch (err) {
                    if (active) {
                        setStatus("error");
                        console.error("File reading failed", err);
                    }
                }
            };

            // Error handler
            reader.onerror = () => {
                if (active) {
                    setStatus("error");
                }
            };

            reader.readAsText(file);
        };

        processFile();

        return () => {
            active = false;
            if (reader.readyState === 1 /* LOADING */) {
                reader.abort();
            }
        };
    }, [file]);

    return { status };
};

export default useImportTransaction;
