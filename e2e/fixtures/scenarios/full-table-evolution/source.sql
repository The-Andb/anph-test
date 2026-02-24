CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `department` varchar(50) DEFAULT 'General',
  `salary` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `hire_date` date NOT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_department` (`department`),
  KEY `idx_name` (`last_name`, `first_name`),
  CONSTRAINT `fk_emp_dept` FOREIGN KEY (`department`) REFERENCES `departments` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB;
