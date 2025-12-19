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
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `material_code` varchar(50) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `category_id` tinyint unsigned NOT NULL,
  `unit_of_measure_id` tinyint unsigned NOT NULL,
  `unit_cost` decimal(13,2) NOT NULL,
  `minimum_stock` decimal(10,2) DEFAULT '0.00',
  `current_stock` decimal(10,2) DEFAULT '0.00',
  `reorder_point` decimal(10,2) DEFAULT '0.00',
  `description` text,
  `created_by` smallint unsigned NOT NULL,
  `modified_by` smallint unsigned NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `material_code` (`material_code`),
  KEY `idx_category` (`category_id`),
  KEY `idx_name` (`material_name`),
  KEY `fk_materials_uom` (`unit_of_measure_id`),
  KEY `fk_materials_created_by` (`created_by`),
  KEY `fk_materials_modified_by` (`modified_by`),
  CONSTRAINT `fk_materials_category` FOREIGN KEY (`category_id`) REFERENCES `cat_material_categories` (`id`),
  CONSTRAINT `fk_materials_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_materials_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_materials_uom` FOREIGN KEY (`unit_of_measure_id`) REFERENCES `cat_unit_of_measure` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'MAT-000001','Cemento Portland',1,1,125.50,50.00,101.00,75.00,'Cemento gris uso general',1,1,'2025-12-16 04:50:55','2025-12-17 19:31:36',1),(2,'MAT-000002','Varilla 3/8',1,2,85.75,50.00,25.00,40.00,'Varilla corrugada 3/8 pulgadas',1,1,'2025-12-16 04:51:05','2025-12-16 04:51:05',1);
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-19 17:29:29
