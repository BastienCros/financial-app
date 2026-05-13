"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import BalanceSummary from "@/components/BalanceSummary";
import DashboardGrid from "@/components/DashboardGrid";
import MonthPicker from "@/components/MonthPicker";
import Button from "@/components/Button";
import ImportCsvModal from "@/components/ImportCsvModal";
import { useAvailableMonths } from "@/hooks/transactions.hooks";

export default function DashboardContent() {
    const { months } = useAvailableMonths();
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [csvModalOpen, setCsvModalOpen] = useState(false);

    // Derive effective month: user selection or default to most recent
    const effectiveMonth =
        selectedMonth ?? (months.length > 0 ? months[0] : null);

    return (
        <>
            <header className="w-full flex justify-between items-center">
                <h1>Overview</h1>
                <div className="flex gap-6">
                    {months.length > 0 && (
                        <MonthPicker
                            currentMonth={effectiveMonth}
                            setMonth={setSelectedMonth}
                        />
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCsvModalOpen(true)}
                    >
                        <PlusIcon size={20} />
                    </Button>
                </div>
            </header>
            <BalanceSummary month={effectiveMonth} />
            <DashboardGrid selectedMonth={effectiveMonth} />
            <ImportCsvModal
                open={csvModalOpen}
                onOpenChange={setCsvModalOpen}
            />
        </>
    );
}
