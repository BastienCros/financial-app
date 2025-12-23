import Link from "next/link";
import styles from "./MainNavigation.module.css";
import { CSSProperties } from "react";

interface NavigationItemProps {
    isActive?: boolean;
    disabled?: boolean;
    href: string;
    color?: string;
    children: React.ReactNode;
}

function NavigationItem({
    isActive = false,
    disabled,
    href,
    color,
    children
}: NavigationItemProps) {
    const style = {"--item-color": color};

    return (
        <Link
            href={href}
            aria-current={isActive ? "page" : undefined}
            aria-disabled={disabled}
            {...(disabled && { tabIndex: -1 })}
            {...(disabled && { "aria-hidden": "true" })}
            className={styles.item}
            style={style as CSSProperties}
        >
            {children}
        </Link>
    )
}

export default NavigationItem;