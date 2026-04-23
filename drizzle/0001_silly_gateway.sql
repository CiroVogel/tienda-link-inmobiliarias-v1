CREATE TABLE `blocked_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`reason` varchar(200) DEFAULT '',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blocked_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`serviceId` int NOT NULL,
	`clientName` varchar(200) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(30) NOT NULL,
	`bookingDate` varchar(10) NOT NULL,
	`bookingTime` varchar(5) NOT NULL,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`totalAmount` decimal(10,2) NOT NULL,
	`depositAmount` decimal(10,2) DEFAULT '0',
	`paymentType` enum('deposit','full') NOT NULL DEFAULT 'full',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `business_profile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(200) NOT NULL DEFAULT 'Mi Negocio',
	`tagline` varchar(300) DEFAULT '',
	`description` text,
	`ownerName` varchar(200) DEFAULT '',
	`ownerTitle` varchar(200) DEFAULT '',
	`ownerBio` text,
	`ownerImageUrl` text,
	`logoUrl` text,
	`heroImageUrl` text,
	`phone` varchar(30) DEFAULT '',
	`whatsapp` varchar(30) DEFAULT '',
	`email` varchar(320) DEFAULT '',
	`address` text,
	`instagram` varchar(200) DEFAULT '',
	`facebook` varchar(200) DEFAULT '',
	`primaryColor` varchar(20) DEFAULT '#1a1a2e',
	`accentColor` varchar(20) DEFAULT '#c9a96e',
	`depositPercentage` int DEFAULT 30,
	`currency` varchar(10) DEFAULT 'ARS',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` varchar(500),
	`caption` varchar(300) DEFAULT '',
	`sortOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`type` enum('booking_confirmation','payment_confirmation','reminder_24h','booking_cancelled') NOT NULL,
	`channel` enum('whatsapp','email') NOT NULL DEFAULT 'whatsapp',
	`recipient` varchar(50) NOT NULL,
	`message` text,
	`status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`preferenceId` varchar(200),
	`paymentId` varchar(200),
	`externalReference` varchar(200),
	`status` enum('pending','approved','rejected','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'ARS',
	`rawData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`slotDuration` int NOT NULL DEFAULT 60,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL DEFAULT '0',
	`duration` int NOT NULL DEFAULT 60,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
