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
-- Table structure for table `cat_states`
--

DROP TABLE IF EXISTS `cat_states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_states` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `nationality_id` tinyint unsigned NOT NULL DEFAULT '1',
  `state_name` varchar(64) NOT NULL,
  `alias` varchar(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alias` (`alias`),
  KEY `nationality_id` (`nationality_id`),
  CONSTRAINT `cat_states_ibfk_1` FOREIGN KEY (`nationality_id`) REFERENCES `cat_nationalities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cat_states`
--

LOCK TABLES `cat_states` WRITE;
/*!40000 ALTER TABLE `cat_states` DISABLE KEYS */;
INSERT INTO `cat_states` VALUES (1,1,'Aguascalientes','ags'),(2,1,'Baja California','bc'),(3,1,'Baja California Sur','bcs'),(4,1,'Campeche','camp'),(5,1,'Chiapas','chis'),(6,1,'Chihuahua','chih'),(7,1,'Coahuila','coah'),(8,1,'Colima','col'),(9,1,'Durango','dgo'),(10,1,'Guanajuato','gto'),(11,1,'Guerrero','gro'),(12,1,'Hidalgo','hgo'),(13,1,'Jalisco','jal'),(14,1,'México','mex'),(15,1,'Michoacán','mich'),(16,1,'Morelos','mor'),(17,1,'Nayarit','nay'),(18,1,'Nuevo León','nl'),(19,1,'Oaxaca','oax'),(20,1,'Puebla','pue'),(21,1,'Querétaro','qro'),(22,1,'Quintana Roo','qroo'),(23,1,'San Luis Potosí','slp'),(24,1,'Sinaloa','sin'),(25,1,'Sonora','son'),(26,1,'Tabasco','tab'),(27,1,'Tamaulipas','tamps'),(28,1,'Tlaxcala','tlax'),(29,1,'Veracruz','ver'),(30,1,'Yucatán','yuc'),(31,1,'Zacatecas','zac'),(32,1,'Ciudad de México','cdmx');
/*!40000 ALTER TABLE `cat_states` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-19 17:29:26
