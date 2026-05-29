CREATE TABLE `sync_state` (
	`id` text PRIMARY KEY NOT NULL,
	`cursor` integer,
	`last_synced_at` integer
);
