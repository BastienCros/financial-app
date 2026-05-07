import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getDb, getOrmObject } from "../setup";
import { getOrm, bulkInsert } from "@/lib/db/orm";
import { transactions } from "@/lib/db/orm/schema";
import { eq, placeholder, and, gte, lt, sql } from "drizzle-orm";

beforeAll(async () => {
    await getOrmObject();
    console.log("[setup] initORM complete");
});

beforeEach(async () => {
    await getOrm().delete(transactions);
    console.log("[setup] table cleared");
});

// ============================================================
// MIGRATIONS
// ============================================================

describe("migrations", () => {
    it("user_version is 1 after initORM", async () => {
        const db = await getDb();
        const result = (await db.exec?.({
            sql: "PRAGMA user_version",
        })) as Array<{ user_version: number }>;

        console.log("[migration] user_version:", result[0].user_version);
        expect(result[0].user_version).toBe(1);
    });

    it("transactions table exists", async () => {
        const db = await getDb();
        const result = (await db.exec?.({
            sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'",
        })) as Array<{ name: string }>;

        console.log("[migration] tables found:", result);
        expect(result[0]?.name).toBe("transactions");
    });
});

// ============================================================
// DRIVER — method: 'run' (INSERT / DELETE)
// ============================================================

describe("driver method: run", () => {
    it("insert single row via drizzle", async () => {
        const orm = getOrm();

        await orm.insert(transactions).values({
            date: "2025-01-15",
            description: "Coffee",
            categoryId: "food",
            amount: -5.5,
        });

        const rows = (await getDb().then((db) =>
            db.exec({ sql: "SELECT * FROM transactions" }),
        )) as object[];

        console.log("[run] rows after insert:", rows);
        expect(rows).toHaveLength(1);
    });
});

// ============================================================
// DRIVER — method: 'all' (SELECT multiple rows)
// ============================================================

describe("driver method: all", () => {
    it("select returns typed array", async () => {
        const orm = getOrm();

        await orm.insert(transactions).values([
            {
                date: "2025-01-15",
                description: "Coffee",
                categoryId: "food",
                amount: -5.5,
            },
            {
                date: "2025-01-20",
                description: "Salary",
                categoryId: "income",
                amount: 3000,
            },
        ]);

        const rows = await orm.select().from(transactions);

        console.log("[all] drizzle result:", rows);
        expect(rows).toHaveLength(2);
        expect(rows[0]).toHaveProperty("description");
        expect(rows[0]).toHaveProperty("amount");
    });

    it("select with where clause", async () => {
        const orm = getOrm();

        await orm.insert(transactions).values([
            {
                date: "2025-01-15",
                description: "Coffee",
                categoryId: "food",
                amount: -5.5,
            },
            {
                date: "2025-01-20",
                description: "Salary",
                categoryId: "income",
                amount: 3000,
            },
        ]);

        const rows = await orm
            .select()
            .from(transactions)
            .where(eq(transactions.categoryId, "food"));

        console.log("[all|where] drizzle result:", rows);
        expect(rows).toHaveLength(1);
        expect(rows[0].description).toBe("Coffee");
    });
});

// ============================================================
// DRIVER — method: 'get' (SELECT single row)
// ============================================================

describe("driver method: get", () => {
    it("returns single typed row", async () => {
        const orm = getOrm();

        await orm.insert(transactions).values({
            date: "2025-01-15",
            description: "Coffee",
            categoryId: "food",
            amount: -5.5,
        });

        const row = await orm
            .select()
            .from(transactions)
            .where(eq(transactions.description, "Coffee"))
            .limit(1);

        console.log("[get] drizzle result:", row);
        expect(row[0].description).toBe("Coffee");
        expect(row[0].amount).toBe(-5.5);
    });
});

// ============================================================
// TRANSACTION
// ============================================================

describe("transaction", () => {
    it("commits all rows when no error", async () => {
        const orm = getOrm();

        await orm.transaction(async (tx) => {
            await tx.insert(transactions).values({
                date: "2025-02-01",
                description: "Tx1",
                categoryId: "food",
                amount: -10,
            });
            await tx.insert(transactions).values({
                date: "2025-02-02",
                description: "Tx2",
                categoryId: "food",
                amount: -20,
            });
        });

        const rows = await orm.select().from(transactions);
        console.log("[transaction:commit] rows:", rows);
        expect(rows).toHaveLength(2);
    });

    it("rolls back all rows on error", async () => {
        const orm = getOrm();

        await expect(
            orm.transaction(async (tx) => {
                await tx.insert(transactions).values({
                    date: "2025-02-01",
                    description: "Tx1",
                    categoryId: "food",
                    amount: -10,
                });
                throw new Error("forced rollback");
            }),
        ).rejects.toThrow("forced rollback");

        const rows = await orm.select().from(transactions);
        console.log("[transaction:rollback] rows:", rows);
        expect(rows).toHaveLength(0);
    });
});

// ============================================================
// BATCH INSERT
// ============================================================

describe("batch insert", () => {
    it("inserts multiple rows in one batch", async () => {
        const orm = getOrm();

        await orm.insert(transactions).values([
            {
                date: "2025-01-01",
                description: "Tx1",
                categoryId: "food",
                amount: -10,
            },
            {
                date: "2025-01-02",
                description: "Tx2",
                categoryId: "food",
                amount: -20,
            },
            {
                date: "2025-01-01",
                description: "Tx2",
                categoryId: "food",
                amount: -10,
            },
        ]);

        const rows = await orm.select().from(transactions);

        console.log("[batch] rows:", rows);
        expect(rows).toHaveLength(3);
    });
});

// ============================================================
// BULK INSERT UTILITY
// ============================================================

describe("bulkInsert utility", () => {
    it("inserts all rows", async () => {
        await bulkInsert(transactions, [
            {
                date: "2025-01-15",
                description: "Coffee",
                categoryId: "food",
                amount: -5.5,
            },
            {
                date: "2025-01-20",
                description: "Salary",
                categoryId: "income",
                amount: 3000,
            },
            {
                date: "2025-02-10",
                description: "Rent",
                categoryId: "housing",
                amount: -1200,
            },
        ]);
        const rows = await getOrm().select().from(transactions);
        console.log("[bulkInsert] rows:", rows);
        expect(rows).toHaveLength(3);
    });

    it("is a no-op when called with an empty array", async () => {
        await bulkInsert(transactions, []);
        const rows = await getOrm().select().from(transactions);
        console.log("[bulkInsert:empty] rows:", rows);
        expect(rows).toHaveLength(0);
    });

    it("throws on UNIQUE constraint violation and leaves prior data intact", async () => {
        const row = {
            date: "2025-01-15",
            description: "Coffee",
            categoryId: "food",
            amount: -5.5,
        };
        await bulkInsert(transactions, [row]);
        await expect(bulkInsert(transactions, [row])).rejects.toThrow();
        const rows = await getOrm().select().from(transactions);
        console.log("[bulkInsert:unique] rows:", rows);
        expect(rows).toHaveLength(1);
    });
});

// ============================================================
// TYPE INFERENCE
// ============================================================

describe("type inference", () => {
    it("result shape matches schema columns", async () => {
        const orm = getOrm();

        await orm.insert(transactions).values({
            date: "2025-01-15",
            description: "Coffee",
            categoryId: "food",
            amount: -5.5,
        });

        const [row] = await orm.select().from(transactions);

        console.log("[types] row:", row);
        // These are compile-time checks — if types are wrong, tsc catches it
        const _id: number | undefined = row.id;
        const _desc: string = row.description;
        const _amount: number | null = row.amount;

        expect(typeof row.id).toBe("number");
        expect(typeof row.description).toBe("string");
    });
});

// ============================================================
// PREPARED STATEMENTS
// ============================================================

describe("prepared statements", () => {
    it("executes prepared select multiple times with different params", async () => {
        const orm = getOrm();

        await orm.insert(transactions).values([
            {
                date: "2025-01-15",
                description: "Coffee",
                categoryId: "food",
                amount: -5.5,
            },
            {
                date: "2025-01-20",
                description: "Salary",
                categoryId: "income",
                amount: 3000,
            },
            {
                date: "2025-01-21",
                description: "Groceries",
                categoryId: "food",
                amount: -80,
            },
        ]);

        const prepared = orm
            .select()
            .from(transactions)
            .where(eq(transactions.categoryId, placeholder("category")))
            .prepare("get_by_category");

        const food = await prepared.execute({ category: "food" });
        const income = await prepared.execute({ category: "income" });

        console.log("[prepared] food:", food);
        console.log("[prepared] income:", income);

        expect(food).toHaveLength(2);
        expect(income).toHaveLength(1);
        expect(income[0].description).toBe("Salary");
    });
});

// ============================================================
// QUERY PATTERNS
// ============================================================

describe("query patterns", () => {
    it("date-range select returns only rows within the range", async () => {
        const orm = getOrm();
        await orm.insert(transactions).values([
            {
                date: "2025-01-15",
                description: "In range",
                categoryId: "food",
                amount: -10,
            },
            {
                date: "2025-02-10",
                description: "Out of range",
                categoryId: "food",
                amount: -20,
            },
        ]);
        const start = "2025-01-01T00:00:00.000Z";
        const end = "2025-02-01T00:00:00.000Z";
        const rows = await orm
            .select()
            .from(transactions)
            .where(
                and(gte(transactions.date, start), lt(transactions.date, end)),
            );
        console.log("[query:date-range] rows:", rows);
        expect(rows).toHaveLength(1);
        expect(rows[0].description).toBe("In range");
    });

    it("sql<T> aggregation computes correct sums", async () => {
        const orm = getOrm();
        await orm.insert(transactions).values([
            {
                date: "2025-01-15",
                description: "Income",
                categoryId: "income",
                amount: 500,
            },
            {
                date: "2025-01-20",
                description: "Expense",
                categoryId: "food",
                amount: -200,
            },
        ]);
        const [row] = await orm
            .select({
                balance: sql<number>`SUM(${transactions.amount})`,
                income: sql<number>`SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END)`,
                expenses: sql<number>`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`,
            })
            .from(transactions);
        console.log("[query|aggregation] row:", row);
        expect(row.balance).toBe(300);
        expect(row.income).toBe(500);
        expect(row.expenses).toBe(200);
    });

    it("selectDistinct with strftime returns unique months newest first", async () => {
        const orm = getOrm();
        await orm.insert(transactions).values([
            {
                date: "2025-01-15",
                description: "Coffee",
                categoryId: "food",
                amount: -5,
            },
            {
                date: "2025-01-20",
                description: "Salary",
                categoryId: "income",
                amount: 3000,
            },
            {
                date: "2025-02-10",
                description: "Rent",
                categoryId: "housing",
                amount: -1200,
            },
        ]);
        const rows = await orm
            .selectDistinct({
                month: sql<string>`strftime('%Y-%m', ${transactions.date})`,
            })
            .from(transactions)
            .orderBy(sql`1 DESC`);
        console.log("[query:distinct-months] rows:", rows);
        expect(rows).toHaveLength(2);
        expect(rows[0].month).toBe("2025-02");
        expect(rows[1].month).toBe("2025-01");
    });
});
