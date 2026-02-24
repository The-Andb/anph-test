CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(50),
  `last_name` varchar(50),
  PRIMARY KEY (`id`),
  KEY `idx_full_name` (`last_name`, `first_name`)
);
