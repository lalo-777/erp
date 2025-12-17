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
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `invoice_type_id` tinyint unsigned NOT NULL,
  `invoice_status_id` tinyint unsigned NOT NULL,
  `customer_id` int unsigned NOT NULL,
  `project_id` int unsigned DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(13,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(13,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(13,2) NOT NULL DEFAULT '0.00',
  `notes` text,
  `created_by` smallint unsigned NOT NULL,
  `modified_by` smallint unsigned NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_status` (`invoice_status_id`),
  KEY `idx_date` (`invoice_date`),
  KEY `fk_invoices_type` (`invoice_type_id`),
  KEY `fk_invoices_created_by` (`created_by`),
  KEY `fk_invoices_modified_by` (`modified_by`),
  CONSTRAINT `fk_invoices_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_invoices_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_invoices_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_invoices_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_invoices_status` FOREIGN KEY (`invoice_status_id`) REFERENCES `cat_invoice_statuses` (`id`),
  CONSTRAINT `fk_invoices_type` FOREIGN KEY (`invoice_type_id`) REFERENCES `cat_invoice_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'INV-000001',1,2,1,NULL,'2025-12-01','2026-01-30',21.00,0.00,0.00,'fsd',1,1,'2025-12-16 04:16:41','2025-12-16 04:16:41',1),(2,'INV-000002',2,2,1,NULL,'2025-12-18','2026-01-30',1.00,0.00,0.00,'gg',1,1,'2025-12-16 04:42:02','2025-12-16 18:14:56',1);
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_invoices_audit` BEFORE UPDATE ON `invoices` FOR EACH ROW BEGIN
    DECLARE v_user_id SMALLINT UNSIGNED;
    DECLARE v_change_date DATETIME;

    -- Get session variables set by application
    SET v_user_id = IFNULL(@user_id, 0);
    SET v_change_date = IFNULL(@change_date, NOW());

    -- Track invoice_status_id changes
    IF NOT (OLD.invoice_status_id <=> NEW.invoice_status_id) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'invoice_status_id', OLD.invoice_status_id, NEW.invoice_status_id, v_user_id, v_change_date);
    END IF;

    -- Track total_amount changes
    IF NOT (OLD.total_amount <=> NEW.total_amount) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'total_amount', OLD.total_amount, NEW.total_amount, v_user_id, v_change_date);
    END IF;

    -- Track subtotal changes
    IF NOT (OLD.subtotal <=> NEW.subtotal) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'subtotal', OLD.subtotal, NEW.subtotal, v_user_id, v_change_date);
    END IF;

    -- Track tax_amount changes
    IF NOT (OLD.tax_amount <=> NEW.tax_amount) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'tax_amount', OLD.tax_amount, NEW.tax_amount, v_user_id, v_change_date);
    END IF;

    -- Track due_date changes
    IF NOT (OLD.due_date <=> NEW.due_date) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'due_date', OLD.due_date, NEW.due_date, v_user_id, v_change_date);
    END IF;

    -- Track customer_id changes
    IF NOT (OLD.customer_id <=> NEW.customer_id) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'customer_id', OLD.customer_id, NEW.customer_id, v_user_id, v_change_date);
    END IF;

    -- Track project_id changes
    IF NOT (OLD.project_id <=> NEW.project_id) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'project_id', OLD.project_id, NEW.project_id, v_user_id, v_change_date);
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

-- Dump completed on 2025-12-16 21:35:03
