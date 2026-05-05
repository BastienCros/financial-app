"use client";

import { useState } from "react";
import BalanceSummary from "@/components/BalanceSummary";
import DashboardGrid from "@/components/DashboardGrid";
import MonthPicker from "@/components/MonthPicker";
import { useAvailableMonths } from "@/hooks/transactions.hooks";

export default function DashboardContent() {
    const { months } = useAvailableMonths();
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    // Derive effective month: user selection or default to most recent
    const effectiveMonth =
        selectedMonth ?? (months.length > 0 ? months[0] : null);

    return (
        <>
            <header className="w-full flex justify-between">
                <h1>Overview</h1>
                {months.length > 0 && (
                    <MonthPicker
                        currentMonth={effectiveMonth}
                        setMonth={setSelectedMonth}
                    />
                )}
            </header>
            <BalanceSummary month={effectiveMonth} />
            <DashboardGrid selectedMonth={effectiveMonth} />
        </>
    );
}
