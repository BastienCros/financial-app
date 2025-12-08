import * as React from "react";
import Card from "@/components/Card";
import CategoryItem from "@/components/CategoryItem";
import { CircleDollarSign } from "lucide-react";
import { cx } from "@/utils";

import styles from "./potsSection.module.css";

interface PotsSectionsProps {
  className?: string;
}

const items = [
  { id: "1", label: "Savings", budget: 159, color: "#277c78", iconUrl: "" },
  { id: "2", label: "Gift", budget: 40, color: "#82c9d7", iconUrl: "" },
  { id: "3", label: "Concert Ticket", budget: 110, color: "#626070", iconUrl: "" },
  { id: "4", label: "New Laptop", budget: 10, color: "#f2cdac", iconUrl: "" },
];


function PotsSection({ className }: PotsSectionsProps) {
  return (
    <Card title="Pots" className={className}>
      <div className={styles.content}>
        <div className={cx(styles.summary, "tw-card")} data-variant="background">
          <CircleDollarSign className="flex-none text-success" size={40} />
          <div className="flex-1">
            <p className="text-fg-subtle">Total Saved</p>
            <p className="mt-4 font-mono text-3xl font-bold">$850</p>
          </div>
        </div>
        <div className={styles.list}>
          {items.map((item) => (
            <CategoryItem
              key={item.id}
              label={item.label}
              budget={item.budget}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

export default PotsSection;
