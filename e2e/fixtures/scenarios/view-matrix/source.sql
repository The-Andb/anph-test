CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255),
  PRIMARY KEY (`id`)
);

CREATE VIEW `active_users` AS SELECT * FROM `users` WHERE `email` IS NOT NULL;
