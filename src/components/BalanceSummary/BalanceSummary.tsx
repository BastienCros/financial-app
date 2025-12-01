import * as React from "react";
import VisuallyHidden from "@/components/VisuallyHidden";
import { cx } from "@/src/lib/utilities";
import styles from "./balanceSummary.module.css";

interface BalanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string,
  value: string,
  variant?: "light" | "dark",
}
function BalanceCard({ title, value, variant = "light" }: BalanceCardProps) {
  return (
    <li className="grow">
      <div className={cx(styles.balanceCard, "tw-card")} data-variant={variant}>
        <h3>{title}</h3>
        <p className="font-mono text-3xl font-bold">${value}</p>
      </div>
    </li>
  )
}

function BalanceSummary() {
  return (
    <div className="w-full">
      <h2><VisuallyHidden>Overview</VisuallyHidden></h2>
      <ul className={styles.balanceList}>
        <BalanceCard title="Current Balance" value="4,836.00" variant="dark" />
        <BalanceCard title="Income" value="3,814.25" />
        <BalanceCard title="Expenses" value="1,700.50" />
      </ul>
    </div>
  );
}

export default BalanceSummary;
