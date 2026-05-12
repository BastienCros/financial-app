import React from "react";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cx } from "@/utils";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { FileUploader } from "@/components/Field";

import { useImportTransaction } from "@/hooks";
import type { ImportStatus } from "@/lib/csv";

interface ImportCsvModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function StatusDescription({ status }: { status: ImportStatus }) {
    const visible = status === "error" || status === "success";
    return (
        <div className={cx("py-3", visible ? "visible" : "invisible")}>
            {status === "error" ? (
                <p className="text-error">
                    Error while importing, you may retry
                </p>
            ) : (
                <p className="text-success">Data imported successfully!</p>
            )}
        </div>
    );
}

function ImportCsvModal({ open, onOpenChange }: ImportCsvModalProps) {
    const [file, setFile] = React.useState<File | null>(null);
    const { status, resetStatus, startProcessing } = useImportTransaction();
    const isLoading = status === "loading";

    const handleFileDrop = (file: File | null) => {
        resetStatus();
        setFile(file);
    };

    const handleSubmit = () => {
        if (file && status === "idle") {
            // Note: processing may continue even if modal is closed - acceptable but worth noting
            startProcessing(file);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) setFile(null);
        resetStatus();
        onOpenChange(open);
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-2xl p-8 w-full max-w-lg shadow-lg focus:outline-none flow">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-bold">
                            Import CSV
                        </Dialog.Title>
                        <Dialog.Close
                            aria-label="Close"
                            className="hover:opacity-50 cursor-pointer"
                        >
                            <X />
                        </Dialog.Close>
                    </div>
                    <Dialog.Description className="pb-3">
                        Import CSV file from your computer
                    </Dialog.Description>
                    <div>
                        <FileUploader
                            id="csv-upload"
                            accept=".csv, text/csv"
                            label="Drop a CSV file here or click to upload"
                            onFileDrop={handleFileDrop}
                            required
                        />

                        <div className="flow mt-2">
                            <StatusDescription status={status} />
                            <Button
                                onClick={handleSubmit}
                                disabled={!file || isLoading}
                            >
                                {isLoading && <Spinner />}
                                Import
                            </Button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default ImportCsvModal;
