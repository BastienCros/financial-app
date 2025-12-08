import { Category } from "@/types";

export const categories: Category[] = [
    {
        id: "transport",
        label: "Transport",
        budget: 40,
        color: "#9DC4BA",
        iconUrl: "/images/categories/transport.svg", // https://lucide.dev/icons/rocket
    },
    {
        id: "entertainment",
        label: "Entertainment",
        budget: 20,
        color: "#267D77",
        iconUrl: "/images/categories/entertainment.svg", // https://lucide.dev/icons/drama
    },
    {
        id: "food",
        label: "Food",
        budget: 200,
        color: "#F2CDAC",
        iconUrl: "/images/categories/food.svg", // https://lucide.dev/icons/shopping-basket
    },
    {
        id: "housing",
        label: "Housing",
        budget: 120,
        color: "#81C9D8",
        iconUrl: "/images/categories/housing.svg", // https://lucide.dev/icons/house
    },
    {
        id: "health",
        label: "Health",
        budget: 100,
        color: "#D8B4E2",
        iconUrl: "/images/categories/health.svg", // https://lucide.dev/icons/heart-plus
    },
    {
        id: "shopping",
        label: "Shopping",
        budget: 0,
        color: "#E8A6A1",
        iconUrl: "/images/categories/shopping.svg", // https://lucide.dev/icons/shopping-bag
    },
    {
        id: "fees",
        label: "Fees",
        budget: 100,
        color: "#C3D9A4",
        iconUrl: "/images/categories/fees.svg", // https://lucide.dev/icons/scale
    },
    {
        id: "other",
        label: "Other",
        budget: 0,
        color: "#D1C1E1",
        iconUrl: "/images/categories/other.svg", // https://lucide.dev/icons/piggy-bank
    },
    {
        id: "income",
        label: "Income",
        budget: 0,
        color: "#98989D",
        iconUrl: "/images/categories/income.svg", // https://lucide.dev/icons/hand-coins
    },
];