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
-- Table structure for table `pre_inventory`
--

DROP TABLE IF EXISTS `pre_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pre_inventory` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `pre_inventory_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `material_id` int unsigned NOT NULL,
  `warehouse_location_id` tinyint unsigned NOT NULL,
  `expected_quantity` decimal(10,2) NOT NULL DEFAULT '0.00',
  `counted_quantity` decimal(10,2) DEFAULT NULL,
  `discrepancy` decimal(10,2) DEFAULT NULL,
  `unit_cost` decimal(13,2) NOT NULL DEFAULT '0.00',
  `discrepancy_value` decimal(13,2) DEFAULT NULL,
  `status_id` tinyint unsigned NOT NULL DEFAULT '1',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `count_date` date NOT NULL,
  `counted_by` smallint unsigned DEFAULT NULL,
  `adjusted` tinyint(1) NOT NULL DEFAULT '0',
  `adjustment_transaction_id` int unsigned DEFAULT NULL,
  `created_by` smallint unsigned NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` smallint unsigned DEFAULT NULL,
  `updated_date` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pre_inventory_number` (`pre_inventory_number`),
  KEY `fk_preinv_counted_by` (`counted_by`),
  KEY `fk_preinv_created_by` (`created_by`),
  KEY `fk_preinv_updated_by` (`updated_by`),
  KEY `fk_preinv_adjustment` (`adjustment_transaction_id`),
  KEY `idx_preinv_material` (`material_id`),
  KEY `idx_preinv_location` (`warehouse_location_id`),
  KEY `idx_preinv_status` (`status_id`),
  KEY `idx_preinv_count_date` (`count_date`),
  KEY `idx_preinv_adjusted` (`adjusted`),
  CONSTRAINT `fk_preinv_adjustment` FOREIGN KEY (`adjustment_transaction_id`) REFERENCES `inventory_transactions` (`id`),
  CONSTRAINT `fk_preinv_counted_by` FOREIGN KEY (`counted_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_preinv_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_preinv_location` FOREIGN KEY (`warehouse_location_id`) REFERENCES `cat_warehouse_locations` (`id`),
  CONSTRAINT `fk_preinv_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_preinv_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pre_inventory`
--

LOCK TABLES `pre_inventory` WRITE;
/*!40000 ALTER TABLE `pre_inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `pre_inventory` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-16 21:35:00
