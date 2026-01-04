"use client";

import { useState } from "react";
import BalanceSummary from "@/components/BalanceSummary";
import DashboardGrid from "@/components/DashboardGrid";
import MonthPicker from "@/components/MonthPicker";
import { useTransactions } from "@/src/contexts";
import { getInitialMonth } from "@/src/helpers";

export default function DashboardContent() {
  const { transactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getInitialMonth(transactions)
  );

  return (
    <>
      <header className="w-full flex justify-between">
        <h1>Overview</h1>
        <MonthPicker currentMonth={selectedMonth} setMonth={setSelectedMonth} />
      </header>
      <BalanceSummary month={selectedMonth} />
      <DashboardGrid className="grow" selectedMonth={selectedMonth} />
    </>
  );
}
