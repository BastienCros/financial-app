import React from "react";

interface SettingSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export const SettingSection = ({ title, description, children }: SettingSectionProps) => {
    return (
        <section className="w-full grid lg:grid-cols-5 gap-x-4 p-2 pb-4">
            <div className="lg:col-span-2 flex flex-col space-y-2">
                <h2>{title}</h2>
                <p className="text-muted">{description}</p>
            </div>
            <ul className="space-y-6 lg:col-span-3">
                {children}
            </ul>
        </section>
    );
};
