CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `tags` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FULLTEXT KEY `ft_search` (`title`, `body`)
) ENGINE=InnoDB;
