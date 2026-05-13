import React from "react";
import { generateId } from "@/utils";
import { NavItem } from "./MainNavigation.types";

import {
    ArrowDownUp,
    ChartPie,
    CircleDollarSign,
    House,
    Receipt,
    Settings,
    Import,
} from "lucide-react";

export const NAV_ITEMS: NavItem[] = [
    {
        id: generateId({ prefix: "main-nav-item" }),
        href: "/",
        label: "Overview",
        icon: House,
        color: "#277c78",
    },
    {
        id: generateId({ prefix: "main-nav-item" }),
        href: "/transactions",
        label: "Transactions",
        icon: ArrowDownUp,
        color: "#82c9d7",
    },
    {
        id: generateId({ prefix: "main-nav-item" }),
        href: "/budgets",
        label: "Budgets",
        icon: ChartPie,
        color: "#E8A6A1",
        disabled: true,
    },
    {
        id: generateId({ prefix: "main-nav-item" }),
        href: "/pots",
        label: "Pots",
        icon: CircleDollarSign,
        color: "#9DC4BA",
        disabled: true,
    },
    {
        id: generateId({ prefix: "main-nav-item" }),
        href: "/bills",
        label: "Recurring Bills",
        icon: Receipt,
        color: "#626070",
        disabled: true,
    },
];
export const SECOND_NAV_ITEMS: NavItem[] = [
    {
        id: generateId({ prefix: "second-nav-item" }),
        href: "/settings",
        label: "Settings",
        icon: Settings,
        color: "#626070",
    },
    // TODO BAB-48
    {
        id: generateId({ prefix: "second-nav-item" }),
        action: () => {},
        label: "Import CSV",
        renderIcon: (c: string) =>
            React.createElement(Import, { className: c }),
        color: "#E8A6A1",
        disabled: true,
    },
];

export const SIDEBAR_WIDTH = "18rem";
export const SIDEBAR_WIDTH_ICON = "5rem";
// TODO for later
export const SIDEBAR_WIDTH_MOBILE = "18rem";
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";
