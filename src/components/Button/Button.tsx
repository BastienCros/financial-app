import { cx } from "@/utils/utilities";
import styles from "./button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function Button({ children, className, ...props }: ButtonProps) {
    return (
        <button className={cx(styles.button, className)} {...props}>
            {children}
        </button>
    );
}

export default Button;
