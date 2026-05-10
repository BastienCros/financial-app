// Columns to port from the CREATE TABLE in src/lib/db/db.ts:
//   id          INTEGER PRIMARY KEY
//   date        TEXT (ISO string)
//   description TEXT NOT NULL
//   categoryId  TEXT NOT NULL
//   amount      REAL
//   created_at  TEXT DEFAULT CURRENT_TIMESTAMP
//   UNIQUE(date, description, amount)
//

import { CategoryId } from "@/types";
import { formatToIsoString } from "@/helpers";
import { sql } from "drizzle-orm";
import {
    integer,
    real,
    sqliteTable,
    text,
    unique,
    customType,
} from "drizzle-orm/sqlite-core";

const isoDate = customType<{ data: string; driverData: string }>({
    dataType: () => "text",
    toDriver: (value) => {
        // Normalize to ISO format
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))
            return formatToIsoString(value);
        return value;
    },
    // fromDriver : passthrough
});

export const transactions = sqliteTable(
    "transactions",
    {
        id: integer("id").primaryKey(),
        date: isoDate("date").notNull(),
        description: text("description").notNull(),
        categoryId: text("categoryId").notNull().$type<CategoryId>(),
        amount: real("amount").notNull(),
        created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (t) => [unique().on(t.date, t.description, t.amount)],
);
