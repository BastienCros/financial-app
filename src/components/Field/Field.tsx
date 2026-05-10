import { cx } from "@/utils/utilities";
import styles from "./field.module.css";

interface FieldProps {
    children: React.ReactNode;
    className?: string;
}

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
}

interface FieldGroupProps {
    legend: string;
    children: React.ReactNode;
    className?: string;
}

function FieldLabel({ children, className, ...props }: FieldLabelProps) {
    return (
        <label className={cx(styles.label, className)} {...props}>
            {children}
        </label>
    );
}

function FieldDescription({
    children,
    className,
    ...props
}: FieldDescriptionProps) {
    return (
        <p className={cx(styles.description, className)} {...props}>
            {children}
        </p>
    );
}

function FieldGroup({ legend, children, className }: FieldGroupProps) {
    return (
        <fieldset className={cx(styles.group, className)}>
            <legend className={styles.legend}>{legend}</legend>
            {children}
        </fieldset>
    );
}

export function Field({ children, className }: FieldProps) {
    return <div className={cx(styles.field, className)}>{children}</div>;
}

Field.Label = FieldLabel;
Field.Description = FieldDescription;
Field.Group = FieldGroup;
