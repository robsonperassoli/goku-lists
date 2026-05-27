ALTER TABLE `list` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `task` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `task` RENAME COLUMN `description` TO `notes`;--> statement-breakpoint
ALTER TABLE `task` ADD `due_date` integer;--> statement-breakpoint
ALTER TABLE `task` ADD `position` real DEFAULT 0.0;
