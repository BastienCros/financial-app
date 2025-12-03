import * as React from "react";
import { cx } from "@/src/lib/utilities";

import styles from "./dashboardGrid.module.css"
import PotsSection from "@/components/PotsSection";
import Transactions from "@/components/Transactions";
import Budgets from "@/components/Budgets";
import RecurringBills from "@/components/RecurringBills";

interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}
function DashboardGrid({ className }: DashboardGridProps) {
  return (
    <div className={cx(styles.grid, className)}>
      {/* <div className={cx(styles.pots, "bg-[#81c9d7]")}>Pots</div> */}
      <PotsSection className={styles.pots} />
      <Transactions className={styles.transactions} />
      <Budgets className={styles.budget} />
      <RecurringBills className={styles.bills} />
    </div>
  )
}

export default DashboardGrid;
