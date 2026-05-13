import { cx } from "@/utils/utilities";
import styles from "./button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "outline";
    size?: "sm";
}

export function Button({
    children,
    variant,
    size,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cx(styles.button, className)}
            type="button"
            data-variant={variant}
            data-size={size}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
