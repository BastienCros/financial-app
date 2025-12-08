'use client'
import { useMemo } from "react";
import { categories } from "@/src/config";
import { calculateCategoryTotal, getCategoryColor } from "@/helpers";
import { useTransactions } from "@/contexts/TransactionsContext";
import Card from "@/components/Card";
import PieChart, { PieItem } from "@/components/PieChart";
import CategoryItem from "@/components/CategoryItem";

import styles from "./budgets.module.css";

// Static computations - only depend on categories config
const budgetCategories = categories.filter(c => c.id !== 'income');
const totalBudget = budgetCategories.reduce((acc, item) => acc + item.budget, 0);

interface SummaryProps {
  total: number,
  limit: number,
}

function Summary({ total, limit }: SummaryProps) {
  return (
    <div className={styles.summaryWrapper}>
      <div className={styles.summary}>
        <p className="text-2xl font-mono font-bold pb-3">${total.toFixed(2)}</p>
        <p className=" text-fg-subtle">of ${limit.toFixed(2)} limit</p>
      </div>
    </div>
  )
}

interface BudgetsProps {
  className?: string;
}

function Budgets({ className }: BudgetsProps) {
  const { transactions } = useTransactions();

  const categorySpend = useMemo(() => {
    return budgetCategories.map(c => ({
      ...c,
      spend: calculateCategoryTotal(c.id, transactions)
    })).filter(c => c.spend !== 0);
  }, [transactions]);

  const totalSpent = useMemo(() => categorySpend.reduce((acc, item) => acc + item.spend, 0), [categorySpend]);

  const pieItems = useMemo(() => {
    return categorySpend.map((item) => ({
      id: item.id,
      label: item.label,
      value: item.spend,
      color: getCategoryColor(item.id)
    } as PieItem))
  }, [categorySpend]);

  return (
    <Card title="Budgets" className={className}>
      {/* TODO Budget container shall be flexible according to its container size instead of viewport size */}
      <div className={styles.container}>
        <div className={styles.chartWrapper}>
          <PieChart items={pieItems} />
          <Summary total={totalSpent} limit={totalBudget} />
        </div>
        <div className={styles.listWrapper}>
          {/* TODO Budget categories make list dont take too much height */}
          <ul className={styles.list}>
            {categorySpend.map((item) => (
              <CategoryItem
                key={item.id}
                label={item.label}
                budget={item.budget}
                spend={item.spend}
                color={item.color}
              />
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default Budgets;
