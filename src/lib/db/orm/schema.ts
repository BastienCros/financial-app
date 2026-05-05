// Columns to port from the CREATE TABLE in src/lib/db/db.ts:
//   id          INTEGER PRIMARY KEY
//   date        TEXT (ISO string)
//   description TEXT NOT NULL
//   categoryId  TEXT NOT NULL
//   amount      REAL
//   created_at  TEXT DEFAULT CURRENT_TIMESTAMP
//   UNIQUE(date, description, amount)
//

import { sql } from "drizzle-orm";
import {
    integer,
    real,
    sqliteTable,
    text,
    unique,
} from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable(
    "transactions",
    {
        id: integer("id").primaryKey(),
        date: text("date").notNull(),
        description: text("description").notNull(),
        categoryId: text("categoryId").notNull(),
        amount: real("amount"),
        created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (t) => [unique().on(t.date, t.description, t.amount)],
);
