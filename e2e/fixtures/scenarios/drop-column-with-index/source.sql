CREATE TABLE `metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_name` varchar(100) NOT NULL,
  `event_value` decimal(10,4) DEFAULT NULL,
  `source` varchar(50) NOT NULL DEFAULT 'web',
  `recorded_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_name` (`event_name`),
  KEY `idx_source` (`source`)
) ENGINE=InnoDB;
