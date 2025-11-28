import * as React from "react";
import { cx } from "@/lib/utilities";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark";
}
function Card({ variant = "light", className, children }: CardProps) {
  const darkClasses = "text-background bg-foreground"
  const isDark = variant === "dark";

  return (
    <div
      className={cx("x-5 p-5 rounded-xl", isDark && darkClasses, className)} >
      {children}
    </div>
  );
}

export default Card;
