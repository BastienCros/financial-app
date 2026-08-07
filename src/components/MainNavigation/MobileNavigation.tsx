"use client";
import { usePathname } from "next/navigation";
import NavigationItem from "./NavigationItem";

import styles from "./MobileNavigation.module.css";
import { NAV_ITEMS } from "./MainNavigation.constants";

// TODO  BAB-48 Add Import CSV action once context moved to Zustand store,
// using a drawer to present it on mobile

function MobileNavigation() {
    const pathname = usePathname();

    return (
        <nav className={styles.container} aria-label="mobile main navigation">
            <h2 className="sr-only">Finance</h2>
            <ul className={styles.list}>
                {/* Main navigation item */}
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <li key={item.href}>
                            <NavigationItem
                                isActive={pathname === item.href}
                                href={item.href}
                                color={item.color}
                                disabled={item.disabled}
                                renderIcon={(c) => <Icon className={c} />}
                                label={item.label}
                            />
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

export default MobileNavigation;
