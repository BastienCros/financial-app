import * as React from "react";
import { Category } from "@/lib/types";

interface CategoryItemProps {
  category: Category;
}

function CategoryItem({ category }: CategoryItemProps) {

  return (
    <div className="flex items-stretch gap-3">

      {/* vertical color bar */}
      <span
        className="flex-none w-1 rounded-full"
        style={{ backgroundColor: category.color }}
      />

      <div className="flex-1 text-nowrap">
        <p className="text-fg-subtle">{category.label}</p>
        <p className="mt-2 font-mono font-bold">${category.amount}</p>
      </div>
    </div>
  )
}


export default CategoryItem;
