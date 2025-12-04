import { Category } from "@/types";

export function getCategoryColor(categoryId: string, categories: Category[]) {
    return categories.find((category) => category.label.toLowerCase() === categoryId.toLowerCase())?.color
}