CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `payload` /*!50700 json */ text,
  `status` varchar(20) /*!50500 NOT NULL */ DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
