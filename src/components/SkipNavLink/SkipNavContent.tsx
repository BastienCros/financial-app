import { DEFAULT_ID } from "./SkipNavLink.constant";

interface SkipNavContentProps extends React.ComponentProps<"div"> {
    contentId?: string;
}

export function SkipNavContent({
    contentId,
    ...rest
}: SkipNavContentProps) {

    const id = contentId || DEFAULT_ID;
    return (
        <div id={id} {...rest} />
    );
}