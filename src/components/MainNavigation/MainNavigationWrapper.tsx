import { cx } from '@/utils';
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from './MainNavigation.constants';

import styles from './MainNavigationWrapper.module.css';

interface MainNavigationWrapperProps extends React.ComponentProps<"div"> {
    children: React.ReactNode;
}

export function MainNavigationWrapper({
    children,
    className,
    style,
}: MainNavigationWrapperProps) {

    return (
        <div
            className={cx(styles.wrapper, className)}
            style={
                {
                    "--sidebar-width": SIDEBAR_WIDTH,
                    "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                    ...style,
                } as React.CSSProperties
            }>
            {children}
        </div>
    );
}