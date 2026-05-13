import { CategoryId } from "@/src/types";
import { CATEGORY_MAP } from "./csv.constants";
import { deburr, toNumber } from "lodash";
import parser from "any-date-parser";

export const normalizeDate = (
    value: string | null,
    locale = "fr-FR",
): string | null => {
    if (value === null) return null;
    const date = parser.fromString(value, locale);
    return date.isValid() ? date.toISOString() : null;
};

// Assuming will get `Credit` and `Debit` field pre-prended with '-' or '+' (or nothing)
export const normalizeAmount = (value: string[] | null): number => {
    if (value === null) return 0;
    return value.reduce((acc, v) => acc + toNumber(v.replace(",", ".")), 0);
};

export const detectCategory = (value: string | null): CategoryId => {
    if (value === null) return "other";

    const normalizedValue = deburr(value.toLowerCase().trim());

    return (
        (Object.keys(CATEGORY_MAP) as CategoryId[]).find((category) =>
            CATEGORY_MAP[category].some((k) => normalizedValue.includes(k)),
        ) ?? "other"
    );
};
