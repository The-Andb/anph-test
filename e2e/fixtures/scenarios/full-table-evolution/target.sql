CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `salary` decimal(12,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `hire_date` date NOT NULL,
  `terminated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  UNIQUE KEY `uq_uuid` (`uuid`),
  KEY `idx_name` (`last_name`, `first_name`),
  KEY `idx_dept` (`department_id`),
  CONSTRAINT `fk_emp_dept_v2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
