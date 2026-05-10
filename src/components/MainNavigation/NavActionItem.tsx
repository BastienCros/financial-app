import { cx } from "@/utils";
import styles from "./MainNavigation.module.css";

interface NavActionItemProps {
    renderIcon: (className: string) => React.ReactNode;
    label: string;
    onClick?: () => void;
}

function NavActionItem({ renderIcon, label, onClick }: NavActionItemProps) {
    return (
        <li>
            <button
                className={cx(styles.item, "w-full cursor-pointer")}
                onClick={onClick}
                type="button"
            >
                {renderIcon(styles.icon)}
                <span className={styles.label}>{label}</span>
            </button>
        </li>
    );
}

export default NavActionItem;
