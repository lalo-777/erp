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
-- Table structure for table `fuel_requisitions`
--

DROP TABLE IF EXISTS `fuel_requisitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel_requisitions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `requisition_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_equipment_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` int unsigned DEFAULT NULL,
  `requisition_date` date NOT NULL,
  `fuel_type` enum('gasoline','diesel','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_liters` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `odometer_reading` int unsigned DEFAULT NULL COMMENT 'Odometer reading at time of requisition',
  `requisition_status` enum('pending','approved','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` smallint unsigned DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `delivered_date` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` smallint unsigned NOT NULL,
  `modified_by` smallint unsigned NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `requisition_code` (`requisition_code`),
  KEY `idx_vehicle_equipment` (`vehicle_equipment_name`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_requisition_date` (`requisition_date`),
  KEY `idx_requisition_status` (`requisition_status`),
  KEY `idx_fuel_type` (`fuel_type`),
  KEY `idx_is_active` (`is_active`),
  KEY `fk_fuel_approved_by` (`approved_by`),
  KEY `fk_fuel_created_by` (`created_by`),
  KEY `fk_fuel_modified_by` (`modified_by`),
  KEY `idx_requisition_code` (`requisition_code`),
  CONSTRAINT `fk_fuel_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fuel_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_fuel_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_fuel_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_requisitions`
--

LOCK TABLES `fuel_requisitions` WRITE;
/*!40000 ALTER TABLE `fuel_requisitions` DISABLE KEYS */;
/*!40000 ALTER TABLE `fuel_requisitions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-16 21:35:03
