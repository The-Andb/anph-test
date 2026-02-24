CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` smallint NOT NULL DEFAULT '0',
  `category_id` bigint unsigned NOT NULL,
  `rating` tinyint DEFAULT NULL,
  `views` mediumint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB;
