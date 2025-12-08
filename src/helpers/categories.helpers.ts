import {CategoryId, Transaction} from '@/types'
import { categories } from "@/config"

/* Getters */
function getCategory(categoryId: CategoryId) {
    return categories.find((category) => category.id === categoryId);
}

export function getCategoryColor(categoryId: CategoryId) {
    return getCategory(categoryId)?.color;
}

export function getCategoryIconUrl(categoryId: CategoryId) {
    return getCategory(categoryId)?.iconUrl;
}
export function getCategoryLabel(categoryId: CategoryId) {
    return getCategory(categoryId)?.label;
}

/* Aggregate helpers */
export function calculateCategoryTotal(categoryId: CategoryId, transactions: Transaction[]) {
    return Math.abs(transactions.reduce((acc, t) => {
        return t.categoryId === categoryId
            ? acc + t.amount
            : acc;
    }, 0));
}