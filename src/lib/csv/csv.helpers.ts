import { Transaction } from "@/src/types";
import { SCHEMA_MAP } from "./csv.constants";
import {
    detectCategory,
    normalizeAmount,
    normalizeDate,
} from "./csv.transformers";

type SchemaField = keyof typeof SCHEMA_MAP;

const isNull = (element: unknown): element is null => element === null;

export const findValues = (
    normalizedRow: Record<string, string>,
    targetField: SchemaField,
): string[] => {
    const validHeaders = SCHEMA_MAP[targetField] as readonly string[];
    return validHeaders
        .filter((h) => h in normalizedRow)
        .map((h) => normalizedRow[h]);
};

export const csvToTransaction = (
    row: Record<string, string>,
): Omit<Transaction, "id"> | undefined => {
    const normalizedRow = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v]),
    );

    const date = normalizeDate(findValues(normalizedRow, "date")[0] ?? null);
    const description = findValues(normalizedRow, "description")[0] ?? "";
    const categoryId = detectCategory(
        findValues(normalizedRow, "category")[0] ?? null,
    );
    const amount = normalizeAmount(findValues(normalizedRow, "amount"));

    if (
        isNull(date) ||
        isNull(description) ||
        isNull(categoryId) ||
        isNull(amount)
    ) {
        return;
    }
    return {
        date,
        description,
        categoryId,
        amount,
    };
};
