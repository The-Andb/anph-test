CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `content` text NOT NULL,
  `url` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_title` (`title`(255)),
  KEY `idx_url` (`url`(191))
) ENGINE=InnoDB;
