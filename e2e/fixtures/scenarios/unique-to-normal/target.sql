CREATE TABLE `email_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `sent_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `uq_recipient_subject` (`recipient`, `subject`)
) ENGINE=InnoDB;
