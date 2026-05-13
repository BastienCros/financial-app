import type { LucideIcon } from "lucide-react";

/** Link-based nav item — rendered by NavigationItem */
type NavLinkItem = {
    id: string;
    href: string;
    label: string;
    icon: LucideIcon;
    color?: string;
    disabled?: boolean;
};

/** Button-based nav item — rendered by NavActionItem */
type NavActionItem = {
    id: string;
    action: () => void;
    label: string;
    renderIcon: (className: string) => React.ReactNode;
    color?: string;
    disabled?: boolean;
};

export type NavItem = NavLinkItem | NavActionItem;
