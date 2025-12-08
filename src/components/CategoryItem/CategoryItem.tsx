import * as React from "react";
import { Category } from "@/types";
import { cx } from "@/utils";

interface CategoryItemProps {
  label: string;
  budget: number,
  spend?: number,
  color: string;
}

function CategoryItem({ label, budget, spend, color }: CategoryItemProps) {

  const budgetString = spend
    ? `$${spend} / $${budget}`
    : `$${budget}`;
  const isBudgetExceeded = !!(spend && spend > budget);

  return (
    <div className="flex items-stretch gap-3">

      {/* vertical color bar */}
      <span
        className="flex-none w-1 rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="flex-1 text-nowrap">
        <p className="text-fg-subtle">{label}</p>
        <p className={cx("mt-2 font-mono font-bold", isBudgetExceeded && "text-error")}>{budgetString}</p>
      </div>
    </div>
  )
}


export default CategoryItem;
