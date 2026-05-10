import React from "react";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cx } from "@/utils";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { Field, Input } from "@/components/Field";

import useImportTransaction, {
    ImportStatus,
} from "./useImportTransaction.hooks";

interface ImportCsvModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormElements extends HTMLFormControlsCollection {
    csv: HTMLInputElement;
}
interface ImportFormElement extends HTMLFormElement {
    readonly elements: FormElements;
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
    const [file, setFile] = React.useState<File | undefined>(undefined);
    const { status } = useImportTransaction(file);
    const isLoading = status === "loading";

    const handleSubmit = (e: React.FormEvent<ImportFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        console.log("Submitted File:", form.elements.csv.files?.[0]?.name);
        setFile(form.elements.csv.files?.[0]);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) setFile(undefined);
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
                    <form onSubmit={handleSubmit}>
                        <Field>
                            <Field.Label htmlFor="csv">CSV file</Field.Label>
                            <Input
                                id="csv"
                                name="csv"
                                type="file"
                                accept=".csv, text/csv"
                                aria-describedby="csv-desc"
                                required
                            />
                            <Field.Description id="csv-desc">
                                Select a CSV file to import
                            </Field.Description>
                        </Field>
                        <div className="flow mt-2">
                            <StatusDescription status={status} />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Spinner />}
                                Import
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default ImportCsvModal;
