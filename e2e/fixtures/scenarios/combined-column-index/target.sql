CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `channel` varchar(50) NOT NULL DEFAULT 'email',
  `priority` tinyint NOT NULL DEFAULT '0',
  `message` text NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_channel_priority` (`channel`, `priority`)
) ENGINE=InnoDB;
