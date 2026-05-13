import * as React from "react";
import { LoaderCircleIcon } from "lucide-react";
import { cx } from "@/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
    return (
        <LoaderCircleIcon
            role="status"
            aria-label="Loading"
            className={cx("size-4 animate-spin", className)}
            {...props}
        />
    );
}

export default Spinner;
