import { cx } from "@/utils";
import styles from "./MainNavigation.module.css";

interface NavActionItemProps {
    renderIcon: (className: string) => React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
}

function NavActionItem({
    renderIcon,
    label,
    onClick,
    disabled,
}: NavActionItemProps) {
    return (
        <button
            className={cx(styles.item, "w-full cursor-pointer")}
            onClick={onClick}
            type="button"
            disabled={disabled}
            aria-disabled={disabled}
        >
            {renderIcon(styles.icon)}
            <span className={styles.label}>{label}</span>
        </button>
    );
}

export default NavActionItem;
