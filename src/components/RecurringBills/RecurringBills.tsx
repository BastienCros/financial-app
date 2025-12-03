import * as React from "react";
import Card from "@/components/Card";
import { Car } from "lucide-react";


interface Props {
  className?: string;
}

const items = [
  { label: "Paid Bills", amount: 190, color: "#277c78" },
  { label: "Total Upcoming", amount: 194.98, color: "#f2cdac" },
  { label: "Due Soon", amount: 59.98, color: "#82c9d7" },
];

function RecurringBills({ className }: Props) {
  return (
    <Card title="Recurring Bills" className={className}>
      <ul className="flex flex-col gap-4">
        {items.map((item) =>
        (
          <li
            key={item.label}
            className="tw-card border-l-4"
            data-variant="background"
            style={{ borderLeftColor: item.color }}
          >
            <div className="flex justify-between">
              <p className="text-fg-subtle">{item.label}</p>
              <p className="font-bold font-mono">${item.amount}</p>
            </div>
          </li>
        )
        )}
      </ul>
    </Card>
  );
}

export default RecurringBills;
