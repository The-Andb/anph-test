CREATE TABLE `metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_value` decimal(10,4) DEFAULT NULL,
  `recorded_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
