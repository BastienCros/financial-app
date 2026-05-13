import React from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { ProfileSection } from "./_components/ProfileSection";

const Settings = () => {
    return (
        <main className="flex flex-col items-center w-full min-h-screen gap-6 px-4 py-8 sm:px-10 max-w-7xl mx-auto">
            <header className="w-full max-w-180 flex justify-between items-center mb-4">
                <h1>Settings</h1>
                <Link
                    href="/"
                    className="text-fg-subtle hover:text-fg text-sm"
                    aria-label="Go back to dashboard"
                >
                    Go Back <span aria-hidden="true">›</span>
                </Link>
            </header>
            <Card className="w-full max-w-240">
                <ul className="flex flex-col divide-y-2 divide-muted-25 space-y-6">
                    <li>
                        <ProfileSection />
                    </li>
                </ul>
            </Card>
        </main>
    );
};

export default Settings;
