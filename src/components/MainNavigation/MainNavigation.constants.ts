import { ArrowDownUp, ChartPie, CircleDollarSign, House, Receipt } from "lucide-react";

export const NAV_ITEMS = [
    { href: "/", label: "Overview", icon: House, color: '#277c78' },
    { href: "/transactions", label: "Transactions", icon: ArrowDownUp, color: '#82c9d7' },
    { href: "/budgets", label: "Budgets", icon: ChartPie, color: '#E8A6A1', disabled: true },
    { href: "/pots", label: "Pots", icon: CircleDollarSign, color: '#9DC4BA', disabled: true },
    { href: "/bills", label: "Recurring Bills", icon: Receipt, color: '#626070', disabled: true }
]
