import * as React from "react";
import { cx } from "@/lib/utilities";

import styles from "./card.module.css";

/* TODO rename DashboardCard */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
}
function Card({ title, className, children }: CardProps) {
  return (
    <div className={cx(styles.card, "tw-card", className)}>
      <div className={styles.cardHeader}>
        <h3 className="text-xl font-bold">{title}</h3>
        <button className={styles.cardAction}>
          Action Placeholder {">"}
        </button>
      </div>
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
}

export default Card;
