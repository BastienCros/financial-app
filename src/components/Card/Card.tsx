import * as React from "react";
import Link from "next/link";
import { cx } from "@/utils";

import styles from "./card.module.css";

export type CardAction =
  | { type: 'link'; href: string; label: string }
  | { type: 'button'; label: string; onClick: () => void }

function renderAction(action: CardAction) {
  if (action.type === 'link') {
    // TypeScript knows: action.href exists, action.onClick doesn't
    return (
      <Link href={action.href} className={styles.cardAction}>
        {action.label} <span aria-hidden="true">›</span>
      </Link>
    );
  } else {
    // TypeScript knows: action.onClick exists, action.href doesn't
    return (
      <button onClick={action.onClick} className={styles.cardAction}>
        {action.label} <span aria-hidden="true">›</span>
      </button>
    );
  }
}

/* TODO rename DashboardCard */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  headingLevel?: "h1" | "h2" | "h3";
  action?: CardAction
  children: React.ReactNode;
};

function Card({ title, headingLevel = "h3", action, className, children }: CardProps) {

  const HeadingTag = headingLevel;

  return (
    <div className={cx(styles.card, "tw-card", className)}>
      <div className={styles.cardHeader}>
        <HeadingTag className="text-xl font-bold">{title}</HeadingTag>
        {action && renderAction(action)}
      </div>
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
}

export default Card;
