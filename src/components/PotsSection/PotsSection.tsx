import * as React from "react";
import Card from "@/components/Card";
import { cx } from "@/lib/utilities";
import { CircleDollarSign } from "lucide-react";

import styles from "./potsSection.module.css";

interface BudgetitemProps {
  label: string;
  amount: number;
  color: string;
}
function BudgetItem({ label, amount, color }: BudgetitemProps) {

  return (
    <div className={styles.budgetItem}>

      {/* vertical color bar */}
      <span
        className="flex-none w-1 h-full rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="flex-1 text-nowrap">
        <p className="text-fg-subtle">{label}</p>
        <p className="mt-2 font-mono font-bold">${amount}</p>
      </div>
    </div>
  )
}

interface PotsSectionsProps {
  className?: string;
}

const items = [
  { label: "Savings", amount: 159, color: "#277c78" },
  { label: "Gift", amount: 40, color: "#82c9d7" },
  { label: "Concert Ticket", amount: 110, color: "#626070" },
  { label: "New Laptop", amount: 10, color: "#f2cdac" },
];


function PotsSection({ className }: PotsSectionsProps) {
  return (
    <Card title="Pots" className={className}>
      <div className={styles.content}>
        <div className={cx(styles.summary, "tw-card")}>
          <CircleDollarSign className="flex-none text-success" size={32} />
          <div className="flex-1">
            <p className="text-fg-subtle">Total Saved</p>
            <p className="mt-5 font-mono text-3xl font-bold">$850</p>
          </div>
        </div>
        <div className={styles.list}>
          {items.map((item) => (
            <BudgetItem
              key={item.label}
              label={item.label}
              amount={item.amount}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

export default PotsSection;
