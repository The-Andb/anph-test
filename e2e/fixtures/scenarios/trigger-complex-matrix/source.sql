CREATE TABLE `audit` (
  `msg` varchar(255)
);

CREATE TABLE `users` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TRIGGER `before_ins` BEFORE INSERT ON `users` FOR EACH ROW
BEGIN
  INSERT INTO audit VALUES ('new row');
END;
