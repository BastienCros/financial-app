import * as React from "react";
import { cx } from "@/utils";
import styles from "./dashboardGrid.module.css"
import PotsSection from "@/components/PotsSection";
import Transactions from "@/components/Transactions";
import Budgets from "@/components/Budgets";
import RecurringBills from "@/components/RecurringBills";
import { CardAction } from "@/components/Card";

interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedMonth: string | null;
  className?: string;
}

const transactionCardAction: CardAction = {
  type: "link",
  href: '/transactions',
  label: "See all",
}

function DashboardGrid({ className, selectedMonth }: DashboardGridProps) {
  return (
    <div className={cx(styles.grid, className)}>
      {/* <div className={cx(styles.pots, "bg-[#81c9d7]")}>Pots</div> */}
      <PotsSection className={styles.pots} />
      <Transactions
        className={styles.transactions}
        count={5}
        action={transactionCardAction} />
      <Budgets className={styles.budget} selectedMonth={selectedMonth} />
      <RecurringBills className={styles.bills} />
    </div>
  )
}

export default DashboardGrid;
