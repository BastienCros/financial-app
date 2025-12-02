import * as React from "react";
import { cx } from "@/src/lib/utilities";

import styles from "./dashboardGrid.module.css"
import PotsSection from "@/components/PotsSection";
import Transactions from "@/components/Transactions";

interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}
function DashboardGrid({ className }: DashboardGridProps) {
  return (
    <div className={cx(styles.grid, className)}>
      {/* <div className={cx(styles.pots, "bg-[#81c9d7]")}>Pots</div> */}
      <PotsSection className={styles.pots} />
      <Transactions className={styles.transactions} />
      <div className={cx(styles.budget, "bg-[#287b77]")}>Budget</div>
      <div className={cx(styles.bills, "bg-[#625f70]")}>Recurring Bills</div>
    </div>
  )
}

export default DashboardGrid;
