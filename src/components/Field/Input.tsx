import { cx } from "@/utils/utilities";
import styles from "./input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export function Input({ error, className, ...props }: InputProps) {
    return (
        <div className={styles.wrapper}>
            <input
                className={cx(
                    styles.input,
                    error && styles.inputError,
                    className,
                )}
                aria-invalid={error ? true : undefined}
                {...props}
            />
            {error && (
                <span className={styles.error} role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
