-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: erp_development
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `work_orders`
--

DROP TABLE IF EXISTS `work_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `work_order_number` varchar(50) NOT NULL,
  `project_id` int unsigned NOT NULL,
  `work_order_type_id` tinyint unsigned NOT NULL,
  `work_order_status_id` tinyint unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `assigned_to` smallint unsigned DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `priority` tinyint unsigned DEFAULT '2' COMMENT '1=Low, 2=Medium, 3=High',
  `created_by` smallint unsigned NOT NULL,
  `modified_by` smallint unsigned NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `work_order_number` (`work_order_number`),
  KEY `idx_project` (`project_id`),
  KEY `idx_assigned` (`assigned_to`),
  KEY `idx_status` (`work_order_status_id`),
  KEY `fk_work_orders_type` (`work_order_type_id`),
  KEY `fk_work_orders_created_by` (`created_by`),
  KEY `fk_work_orders_modified_by` (`modified_by`),
  CONSTRAINT `fk_work_orders_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_work_orders_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_work_orders_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_work_orders_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_work_orders_status` FOREIGN KEY (`work_order_status_id`) REFERENCES `cat_work_order_statuses` (`id`),
  CONSTRAINT `fk_work_orders_type` FOREIGN KEY (`work_order_type_id`) REFERENCES `cat_work_order_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_orders`
--

LOCK TABLES `work_orders` WRITE;
/*!40000 ALTER TABLE `work_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_work_orders_audit` BEFORE UPDATE ON `work_orders` FOR EACH ROW BEGIN
    DECLARE v_user_id SMALLINT UNSIGNED;
    DECLARE v_change_date DATETIME;

    -- Get session variables set by application
    SET v_user_id = IFNULL(@user_id, 0);
    SET v_change_date = IFNULL(@change_date, NOW());

    -- Track work_order_status_id changes
    IF NOT (OLD.work_order_status_id <=> NEW.work_order_status_id) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'work_order_status_id', OLD.work_order_status_id, NEW.work_order_status_id, v_user_id, v_change_date);
    END IF;

    -- Track assigned_to changes
    IF NOT (OLD.assigned_to <=> NEW.assigned_to) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'assigned_to', OLD.assigned_to, NEW.assigned_to, v_user_id, v_change_date);
    END IF;

    -- Track completion_date changes
    IF NOT (OLD.completion_date <=> NEW.completion_date) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'completion_date', OLD.completion_date, NEW.completion_date, v_user_id, v_change_date);
    END IF;

    -- Track due_date changes
    IF NOT (OLD.due_date <=> NEW.due_date) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'due_date', OLD.due_date, NEW.due_date, v_user_id, v_change_date);
    END IF;

    -- Track priority changes
    IF NOT (OLD.priority <=> NEW.priority) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'priority', OLD.priority, NEW.priority, v_user_id, v_change_date);
    END IF;

    -- Update modified tracking
    SET NEW.modified_by = v_user_id;
    SET NEW.modified_date = v_change_date;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-19 17:29:30
