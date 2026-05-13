import React from "react";

interface SettingItemProps {
    children: React.ReactNode;
}

export const SettingItem = ({ children }: SettingItemProps) => {
    return (
        <div className="flex flex-col items-start space-y-2 m-2">
            {children}
        </div>
    );
};
