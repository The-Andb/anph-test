CREATE TABLE `departments` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `employees` (
  `id` int NOT NULL,
  `dept_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
