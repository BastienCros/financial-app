import { cx } from "@/utils";
interface CategoryItemProps {
  label: string;
  budget: number,
  spend?: number,
  color: string;
}

const format = (num: number) => {
  const fixed = num.toFixed(2);
  return parseFloat(fixed).toString();
}

function CategoryItem({ label, budget, spend, color }: CategoryItemProps) {

  let budgetString;

  if (spend === undefined) {
    // Only display Budget
    const formatedBudget = format(budget);
    budgetString = `$${formatedBudget}`
  } else {
    const formatedBudget = format(budget);
    const formatedSpend = format(spend);

    // Here budget <= 0 means no budget limits
    budgetString = budget > 0
      ? `$${formatedSpend} / $${formatedBudget}`
      : `$${formatedSpend}`;
  }

  const isBudgetExceeded = budget === 0 ? false : !!(spend && spend > budget);

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
