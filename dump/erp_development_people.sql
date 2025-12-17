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
-- Table structure for table `people`
--

DROP TABLE IF EXISTS `people`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `people` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `person_names` varchar(255) NOT NULL,
  `last_name1` varchar(255) NOT NULL,
  `last_name2` varchar(255) DEFAULT NULL,
  `gender_id` tinyint unsigned DEFAULT '1',
  `birth_date` date NOT NULL,
  `birth_place` varchar(6) DEFAULT NULL,
  `person_title_id` tinyint unsigned DEFAULT '1',
  `marital_status_id` tinyint unsigned DEFAULT '1',
  `rfc` varchar(13) NOT NULL,
  `curp` varchar(18) DEFAULT NULL,
  `phone1` varchar(15) DEFAULT NULL,
  `phone2` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `nationality_id` tinyint unsigned DEFAULT '1',
  `is_active` tinyint DEFAULT '1',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfc` (`rfc`),
  KEY `gender_id` (`gender_id`),
  KEY `person_title_id` (`person_title_id`),
  KEY `marital_status_id` (`marital_status_id`),
  KEY `nationality_id` (`nationality_id`),
  CONSTRAINT `people_ibfk_1` FOREIGN KEY (`gender_id`) REFERENCES `cat_genders` (`id`),
  CONSTRAINT `people_ibfk_2` FOREIGN KEY (`person_title_id`) REFERENCES `cat_person_titles` (`id`),
  CONSTRAINT `people_ibfk_3` FOREIGN KEY (`marital_status_id`) REFERENCES `cat_marital_statuses` (`id`),
  CONSTRAINT `people_ibfk_4` FOREIGN KEY (`nationality_id`) REFERENCES `cat_nationalities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `people`
--

LOCK TABLES `people` WRITE;
/*!40000 ALTER TABLE `people` DISABLE KEYS */;
INSERT INTO `people` VALUES (1,'Administrator','System','User',1,'1989-12-31',NULL,1,1,'ADMIN000000XX','ADMIN00000HXXXXXX0','0000000000',NULL,'admin@erp.com',1,1,'2025-12-15 16:48:10','2025-12-15 16:48:10');
/*!40000 ALTER TABLE `people` ENABLE KEYS */;
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
