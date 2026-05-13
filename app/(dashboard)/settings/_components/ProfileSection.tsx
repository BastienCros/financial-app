import React from "react";
import { Field, Input } from "@/components/Field";
import { SettingSection, SettingItem } from "@/components/SettingSection";

export const ProfileSection = () => {
    return (
        <SettingSection
            title="Global Settings"
            description="Manage your personal information and role."
        >
            <li>
                <SettingItem>
                    <Field className="w-full">
                        <Field.Label htmlFor="user-name">
                            First Name
                        </Field.Label>
                        <Input
                            type="text"
                            id="user-name"
                            name="name"
                            placeholder="John"
                        />
                    </Field>
                </SettingItem>
            </li>
            <li>
                <SettingItem>
                    <Field className="w-full">
                        <Field.Label htmlFor="user-lastname">
                            Last Name
                        </Field.Label>
                        <Input
                            type="text"
                            id="user-lastname"
                            name="lastname"
                            placeholder="Doe"
                        />
                    </Field>
                </SettingItem>
            </li>
            <li>
                <SettingItem>
                    <Field className="w-full">
                        <Field.Label htmlFor="user-mail">Email</Field.Label>
                        <Input
                            type="email"
                            id="user-mail"
                            name="mail"
                            placeholder="Email address"
                        />
                    </Field>
                </SettingItem>
            </li>
        </SettingSection>
    );
};
