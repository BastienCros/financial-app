import * as React from "react";
import Card from "@/components/Card";
import PieChart, { PieItem } from "@/components/PieChart";
import CategoryItem from "@/components/CategoryItem";
import { Category } from "@/lib/types";

import styles from "./budgets.module.css";

const categories: Category[] = [
  { label: "Entertainment", amount: 50, color: "#267D77" },
  { label: "Bills", amount: 750, color: "#81C9D8" },
  { label: "Dining Out", amount: 75, color: "#F2CDAC" },
  { label: "Personal Care", amount: 100, color: "#625F71" },
];
const pieItems = categories.map((item) => ({ id: item.label, label: item.label, value: item.amount, color: item.color } as PieItem))


interface BudgetsProps {
  className?: string;
}

function Budgets({ className }: BudgetsProps) {
  return (
    <Card title="Budgets" className={className}>
      <div className={styles.container}>
        <div className={styles.chartWrapper}>
          <PieChart items={pieItems} />
        </div>
        <div className={styles.listWrapper}>
          <ul className={styles.list}>
            {categories.map((item) => (
              <CategoryItem key={item.label} category={item} />
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default Budgets;
