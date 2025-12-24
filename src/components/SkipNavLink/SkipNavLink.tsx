import * as React from "react";
import { cx } from "@/utils";
import { DEFAULT_ID } from "./SkipNavLink.constant";

import styles from "./SkipNavLink.module.css";


interface SkipNavLinkProps extends React.ComponentProps<"a"> {
  children?: React.ReactNode;
  contentId?: string;
}


function SkipNavLink({
  contentId,
  children = "Skip to content",
  className,
  ...rest
}: SkipNavLinkProps) {

  const id = contentId || DEFAULT_ID;
  return (
    <a
      href={`#${id}`}
      className={cx(styles.skipNavLink, className)}
      {...rest}
    >
      {children}
    </a>
  );
}

export default SkipNavLink;
