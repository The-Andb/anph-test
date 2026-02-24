CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255),
  PRIMARY KEY (`id`)
);

CREATE VIEW `active_users` AS SELECT `id`, `email` FROM `users` WHERE `email` LIKE '%@%';
