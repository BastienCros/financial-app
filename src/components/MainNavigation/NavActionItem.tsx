import { cx } from "@/utils";
import itemStyles from "./NavigationItem.module.css";

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
        <li>
            <button
                className={cx(itemStyles.item, "w-full cursor-pointer")}
                onClick={onClick}
                type="button"
                disabled={disabled}
                aria-disabled={disabled}
            >
                {renderIcon(itemStyles.icon)}
                <span className={cx(itemStyles.label, "animate-fadein")}>{label}</span>
            </button>
        </li>
    );
}

export default NavActionItem;
