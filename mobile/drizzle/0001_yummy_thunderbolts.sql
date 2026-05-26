CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`operation` text NOT NULL,
	`created_at` integer NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`attempted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sync_queue_table_record_idx` ON `sync_queue` (`table_name`,`record_id`);--> statement-breakpoint
ALTER TABLE `list` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `task` ADD `deleted_at` integer;