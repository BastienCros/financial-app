import * as React from "react";
import { cx } from "@/src/lib/utilities";

import styles from "./dashboardGrid.module.css"

interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}
function DashboardGrid({ className }: DashboardGridProps) {
  return (
    <div className={cx(styles.grid, "gap-5", className)}>
      <div className={cx(styles.pots, "bg-[#81c9d7]")}>Pots</div>
      <div className={cx(styles.transactions, "bg-[#f3ccab]")}>Transactions</div>
      <div className={cx(styles.budget, "bg-[#287b77]")}>Budget</div>
      <div className={cx(styles.bills, "bg-[#625f70]")}>Recurring Bills</div>
    </div>
  )
}

export default DashboardGrid;
