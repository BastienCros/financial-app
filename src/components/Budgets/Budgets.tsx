import * as React from "react";
import Card from "@/components/Card";
import PieChart, { PieItem } from "@/components/PieChart";
import CategoryItem from "@/components/CategoryItem";
import { Category } from "@/types";

import styles from "./budgets.module.css";
import { getCategoryColor } from "./Budget.helpers";

const categories: Category[] = [
  { label: "Entertainment", budget: 50, color: "#267D77" },
  { label: "Bills", budget: 750, color: "#81C9D8" },
  { label: "Dining Out", budget: 75, color: "#F2CDAC" },
  { label: "Personal Care", budget: 100, color: "#625F71" },
];
const totalBudget = categories.reduce((acc, item) => acc + item.budget, 0);

const categorySpend: { categoryId: string; spent: number }[] = [
  { categoryId: "Bills", spent: 200 },
  { categoryId: "Dining Out", spent: 60 },
  { categoryId: "Personal Care", spent: 40 },
  { categoryId: "Entertainment", spent: 38 },
];
const totalSpent = categorySpend.reduce((acc, item) => acc + item.spent, 0);

const pieItems = categorySpend.map((item) => ({ id: item.categoryId, label: item.categoryId, value: item.spent, color: getCategoryColor(item.categoryId, categories) } as PieItem));

interface SummaryProps {
  total: number,
  limit: number,
}

function Summary({ total, limit }: SummaryProps) {
  return (
    <div className={styles.summaryWrapper}>
      <div className={styles.summary}>
        <p className="text-3xl font-mono font-bold pb-3">${total}</p>
        <p className="text-fg-subtle">of ${limit} limit</p>
      </div>
    </div>
  )
}

interface BudgetsProps {
  className?: string;
}

function Budgets({ className }: BudgetsProps) {
  return (
    <Card title="Budgets" className={className}>
      <div className={styles.container}>
        <div className={styles.chartWrapper}>
          <PieChart items={pieItems} />
          <Summary total={totalSpent} limit={totalBudget} />
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
