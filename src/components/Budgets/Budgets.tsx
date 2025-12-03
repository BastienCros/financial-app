import * as React from "react";
import Card from "@/components/Card";
import PieChart, { PieItem } from "@/components/PieChart";

interface Props {
  className?: string;
}

const categories = [
  { name: "Bills", amount: 750, color: "#81C9D8" },
  { name: "Dining Out", amount: 75, color: "#F2CDAC" },
  { name: "Personal Care", amount: 100, color: "#625F71" },
  { name: "Entertainment", amount: 50, color: "#267D77" },
];
const pieItems = categories.map((item) => ({ id: item.name, label: item.name, value: item.amount, color: item.color } as PieItem))


function Budgets({ className }: Props) {
  return (
    <Card title="Budgets" className={className}>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="flex-1 max-w-60 lg:max-w-70 mx-auto" >
          <PieChart items={pieItems} />
        </div>
        <div className="flex-none w-48 md:w-52">
          Categories list
        </div>
      </div>
    </Card>
  );
}

export default Budgets;
