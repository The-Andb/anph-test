CREATE TABLE `departments` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `employees` (
  `id` int NOT NULL,
  `dept_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
