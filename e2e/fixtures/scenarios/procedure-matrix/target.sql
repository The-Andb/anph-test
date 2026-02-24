CREATE PROCEDURE `simple_proc`(IN `p_id` INT)
BEGIN
  SELECT * FROM employees WHERE id = p_id;
END;
