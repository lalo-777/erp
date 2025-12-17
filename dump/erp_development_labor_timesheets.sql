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
-- Table structure for table `labor_timesheets`
--

DROP TABLE IF EXISTS `labor_timesheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `labor_timesheets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `timesheet_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `worker_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` int unsigned DEFAULT NULL,
  `work_date` date NOT NULL,
  `hours_worked` decimal(5,2) NOT NULL,
  `hourly_rate` decimal(10,2) NOT NULL,
  `performance_score` decimal(3,2) DEFAULT NULL COMMENT 'Performance score from 0 to 10',
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','approved','paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` smallint unsigned NOT NULL,
  `modified_by` smallint unsigned NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `timesheet_code` (`timesheet_code`),
  KEY `idx_worker_name` (`worker_name`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_work_date` (`work_date`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_is_active` (`is_active`),
  KEY `fk_labor_created_by` (`created_by`),
  KEY `fk_labor_modified_by` (`modified_by`),
  KEY `idx_timesheet_code` (`timesheet_code`),
  CONSTRAINT `fk_labor_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_labor_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_labor_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `labor_timesheets`
--

LOCK TABLES `labor_timesheets` WRITE;
/*!40000 ALTER TABLE `labor_timesheets` DISABLE KEYS */;
INSERT INTO `labor_timesheets` VALUES (1,'TS-000001','asdf',1,'2025-12-18',1.00,1.00,1.00,1.00,'pending',NULL,1,1,'2025-12-16 17:31:37','2025-12-16 17:31:37',1);
/*!40000 ALTER TABLE `labor_timesheets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-16 21:35:01
