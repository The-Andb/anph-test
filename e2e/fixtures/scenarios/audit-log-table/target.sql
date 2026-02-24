CREATE TABLE `audit_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','IMPORT') NOT NULL,
  `severity` enum('INFO','WARNING','CRITICAL') NOT NULL DEFAULT 'INFO',
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` bigint DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `diff_summary` varchar(1000) DEFAULT NULL,
  `user_id` int NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `session_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_action_severity` (`action`, `severity`),
  KEY `idx_table_record` (`table_name`, `record_id`),
  KEY `idx_user_session` (`user_id`, `session_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB;
