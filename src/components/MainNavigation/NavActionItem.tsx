import { cx } from "@/src/utils";
import styles from "./MainNavigation.module.css";

interface NavActionItemProps {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
}

function NavActionItem({ icon: Icon, label, onClick }: NavActionItemProps) {
    return (
        <li>
            <button
                className={cx(styles.item, "w-full cursor-pointer")}
                onClick={onClick}
            >
                <Icon className={styles.icon} />
                <span className={styles.label}>{label}</span>
            </button>
        </li>
    );
}

export default NavActionItem;
