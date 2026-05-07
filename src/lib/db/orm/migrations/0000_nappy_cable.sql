CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`categoryId` text NOT NULL,
	`amount` real NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_date_description_amount_unique` ON `transactions` (`date`,`description`,`amount`);