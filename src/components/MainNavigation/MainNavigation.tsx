'use client'
import { usePathname } from "next/navigation";
import { useState } from "react";
import SkipNavLink from "@/components/SkipNavLink";
import { ArrowBigLeftDash } from "lucide-react";
import NavigationItem from "./NavigationItem";
import { NAV_ITEMS } from "./MainNavigation.constants"
import styles from './MainNavigation.module.css'

// TODO MainNavigation collapsed state is currently stored in memory, if needed for many page later consider creating a context
// TODO add "got to main content" hidden link

function MainNavigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav
      className={styles.container}
      aria-label="main navigation"
      data-collapsed={isCollapsed}
    >
      <h2
        className="pt-7 pl-7 text-2xl font-extrabold font-mono"
      >
        <span className={styles.logo}>F</span><span>inance</span>
      </h2>
      {/* Skip to main content */}
      <SkipNavLink />
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <NavigationItem
                isActive={pathname === item.href}
                href={item.href}
                color={item.color}
                disabled={item.disabled}
              >
                <Icon className={styles.icon} />
                <span className={styles.label}>{item.label}</span>
              </NavigationItem>
            </li>
          );
        })}
      </ul>
      <button
        className={styles.collapseButton}
        onClick={() => setIsCollapsed(prev => !prev)}
        aria-label={isCollapsed ? "Expand menu" : "Minimize menu"}
        aria-expanded={!isCollapsed}
      >
        <ArrowBigLeftDash className={styles.icon} /> <span className={styles.label}>Minimize Menu</span>
      </button>
    </nav>
  );
}

export default MainNavigation;
