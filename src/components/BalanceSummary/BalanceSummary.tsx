'use client'
import { useMemo } from "react";
import VisuallyHidden from "@/components/VisuallyHidden";
import { cx } from "@/utils";
import { useTransactions } from "@/src/contexts";
import { getTotalIncome, getBalance, getTotalExpenses, formatCurrency, getMonthTransactions } from '@/src/helpers';

import styles from "./balanceSummary.module.css";

interface BalanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string,
  amount: number,
  variant?: "light" | "dark",
}
function BalanceCard({ title, amount, variant = "light" }: BalanceCardProps) {

  return (
    <li className="grow">
      <div className={cx(styles.balanceCard, "tw-card")} data-variant={variant}>
        <h3>{title}</h3>
        <p className="font-mono text-3xl font-bold">{formatCurrency(amount)}</p>
      </div>
    </li>
  )
}

interface BalanceSummaryProps {
  month: Date | null;
}

function BalanceSummary({ month }: BalanceSummaryProps) {
  const { transactions } = useTransactions();
  
  // Two memos here are not for performance (can work with one) but for readability
  const currentMonthTransactions = useMemo(
    () => getMonthTransactions(transactions, month),
    [transactions, month]
  );

  const summary = useMemo(() => ({
    balance: getBalance(currentMonthTransactions),
    income: getTotalIncome(currentMonthTransactions),
    expenses: getTotalExpenses(currentMonthTransactions)
  }), [currentMonthTransactions]);

  return (
    <div className="w-full">
      <h2><VisuallyHidden>Overview</VisuallyHidden></h2>
      <ul className={styles.balanceList}>
        <BalanceCard title="Current Balance" amount={summary.balance} variant="dark" />
        <BalanceCard title="Income" amount={summary.income} />
        <BalanceCard title="Expenses" amount={summary.expenses} />
      </ul>
    </div>
  );
}

export default BalanceSummary;
