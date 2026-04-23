ALTER TABLE `business_profile` ADD `slug` varchar(100) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `business_profile` ADD CONSTRAINT `business_profile_slug_unique` UNIQUE(`slug`);