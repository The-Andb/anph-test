CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quantity` smallint(6) NOT NULL DEFAULT '0',
  `category_id` bigint(20) unsigned NOT NULL,
  `rating` tinyint(4) DEFAULT NULL,
  `views` mediumint(9) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB;
