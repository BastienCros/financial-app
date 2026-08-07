import Link from "next/link";
import { CSSProperties } from "react";
import { cx } from "@/utils";

import styles from "./NavigationItem.module.css";

interface NavigationItemProps {
    isActive?: boolean;
    disabled?: boolean;
    href: string;
    color?: string;
    renderIcon: (className: string) => React.ReactNode;
    label: string;
}

function NavigationItem({
    isActive = false,
    disabled,
    href,
    color,
    renderIcon,
    label
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
            {renderIcon(styles.icon)}
            <span className={cx(styles.label, "animate-fadein")}>{label}</span>
        </Link>
    )
}

export default NavigationItem;
