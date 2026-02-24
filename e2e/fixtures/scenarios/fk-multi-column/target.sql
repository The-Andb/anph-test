CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `method_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_method` (`order_id`, `method_id`),
  CONSTRAINT `fk_payment_ref` FOREIGN KEY (`order_id`, `method_id`) REFERENCES `order_methods` (`order_id`, `method_id`) ON DELETE CASCADE
) ENGINE=InnoDB;
