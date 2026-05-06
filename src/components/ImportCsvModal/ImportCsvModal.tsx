import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Button from "@/components/Button";
import { Field, Input } from "@/components/Field";

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

function ImportCsvModal({ open, onOpenChange }: ImportCsvModalProps) {
    const handleSubmit = (e: React.FormEvent<ImportFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        console.log("Submitted File:", form.elements.csv.files?.[0].name);
    };

    return (
        <Dialog.Root open={true} onOpenChange={onOpenChange}>
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
                                required
                            />
                            <Field.Description>
                                Select a CSV file to import
                            </Field.Description>
                        </Field>
                        <Button type="submit" className="mt-8">
                            Import
                        </Button>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default ImportCsvModal;
