"use client";
import { useMemo } from "react";
import { categories } from "@/src/config";
import { calculateCategoryTotal } from "@/helpers";
import Card from "@/components/Card";
import PieChart, { PieItem } from "@/components/PieChart";
import CategoryItem from "@/components/CategoryItem";
import { useMonthTransactions } from "@/hooks/transactions.hooks";

import styles from "./budgets.module.css";

function BudgetsSkeleton({
    className,
    message,
}: {
    className?: string;
    message: string;
}) {
    return (
        <Card title="Budgets" className={className}>
            <div className={styles.container}>
                <p className="ml-2 text-gray-500">{message}</p>
            </div>
        </Card>
    );
}

// Limit the number of categories displayed
const NUMBER_OF_CATEGORIES = 3;

// Static computations - only depend on categories config
const budgetCategories = categories.filter((c) => c.id !== "income");
const totalBudget = budgetCategories.reduce(
    (acc, item) => acc + item.budget,
    0,
);

interface SummaryProps {
    total: number;
    limit: number;
}

function Summary({ total, limit }: SummaryProps) {
    return (
        <div className={styles.summaryWrapper}>
            <div className={styles.summary}>
                <p className={styles.summaryTotal}> ${total.toFixed(2)}</p>
                <p className={styles.summaryLimit}>
                    of <span className="font-medium">${limit.toFixed(2)}</span>{" "}
                    limit
                </p>
            </div>
        </div>
    );
}

interface BudgetsProps {
    selectedMonth: string | null;
    className?: string;
}

function Budgets({ className, selectedMonth }: BudgetsProps) {
    const {
        data: currentMonthTransactions,
        loading,
        error,
    } = useMonthTransactions(selectedMonth ?? "");

    const categorySpend = useMemo(() => {
        return budgetCategories
            .map((c) => ({
                ...c,
                spend: calculateCategoryTotal(c.id, currentMonthTransactions),
            }))
            .filter((c) => c.spend !== 0)
            .sort((a, b) => b.spend - a.spend);
    }, [currentMonthTransactions]);

    const totalSpent = categorySpend.reduce((acc, item) => acc + item.spend, 0);

    // Compute total on remaining categories for Chart
    const otherTotal = categorySpend
        .slice(NUMBER_OF_CATEGORIES)
        .reduce((acc, item) => acc + item.spend, 0);

    // Extract top `NUMBER_OF_CATEGORIES` categories
    const topCategories = [
        ...categorySpend.slice(0, NUMBER_OF_CATEGORIES),
        // Add extra items for remaining categories
        {
            id: "other",
            label: "Other",
            spend: otherTotal,
            budget: 0,
            color: "#625F70",
        },
    ];
    const pieItems = [
        // Convert categories to Pie Chart items
        ...topCategories.map(
            (item) =>
                ({
                    id: item.id,
                    label: item.label,
                    value: item.spend,
                    color: item.color,
                }) as PieItem,
        ),
    ];

    if (!selectedMonth)
        return (
            <BudgetsSkeleton
                className={className}
                message="Select a month to view your budgets."
            />
        );
    if (loading)
        return <BudgetsSkeleton className={className} message="Loading..." />;
    if (!currentMonthTransactions?.length)
        return (
            <BudgetsSkeleton
                className={className}
                message="No budget data for this month."
            />
        );

    return (
        <Card title="Budgets" className={className}>
            {/* TODO Budget container shall be flexible according to its container size instead of viewport size */}
            <div className={styles.container}>
                <div className={styles.chartWrapper}>
                    <PieChart items={pieItems} />
                    <Summary total={totalSpent} limit={totalBudget} />
                </div>
                <div className={styles.listWrapper}>
                    <ul className={styles.list}>
                        {topCategories.map((item) => (
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
            {/* TODO dead code as error will return no data => early return. action is to handle error so relevant message can be displayed */}
            {error && <div className="text-red-600 mt-1">{error}</div>}
        </Card>
    );
}

export default Budgets;
