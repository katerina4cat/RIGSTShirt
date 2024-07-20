CREATE DATABASE  IF NOT EXISTS `RIGSTShirt` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `RIGSTShirt`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 192.168.0.216    Database: RIGSTShirt
-- ------------------------------------------------------
-- Server version	8.0.35-0ubuntu0.23.04.1

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
-- Table structure for table `clientInfo`
--

DROP TABLE IF EXISTS `clientInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientInfo` (
  `id` bigint unsigned NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `name` tinytext NOT NULL,
  `surname` tinytext NOT NULL,
  `lastname` tinytext,
  `phone` bigint unsigned NOT NULL,
  `email` tinytext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clientinfo_phone_unique` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientInfo`
--

LOCK TABLES `clientInfo` WRITE;
/*!40000 ALTER TABLE `clientInfo` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientInfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveryInfo`
--

DROP TABLE IF EXISTS `deliveryInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveryInfo` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `entrance` varchar(16) NOT NULL,
  `apartment` varchar(16) NOT NULL,
  `description` varchar(1024) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveryInfo`
--

LOCK TABLES `deliveryInfo` WRITE;
/*!40000 ALTER TABLE `deliveryInfo` DISABLE KEYS */;
/*!40000 ALTER TABLE `deliveryInfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `deliveryType` bigint NOT NULL,
  `PVZID` varchar(128) DEFAULT NULL,
  `clientID` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `clientInfo_idx` (`clientID`),
  CONSTRAINT `clientInfo` FOREIGN KEY (`clientID`) REFERENCES `clientInfo` (`id`),
  CONSTRAINT `deliveryInfo` FOREIGN KEY (`id`) REFERENCES `deliveryInfo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderPosition`
--

DROP TABLE IF EXISTS `orderPosition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderPosition` (
  `orderID` bigint unsigned NOT NULL,
  `productID` bigint unsigned NOT NULL,
  PRIMARY KEY (`orderID`,`productID`),
  KEY `orderposition_productid_foreign` (`productID`),
  CONSTRAINT `orderposition_orderid_foreign` FOREIGN KEY (`orderID`) REFERENCES `order` (`id`),
  CONSTRAINT `orderposition_productid_foreign` FOREIGN KEY (`productID`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderPosition`
--

LOCK TABLES `orderPosition` WRITE;
/*!40000 ALTER TABLE `orderPosition` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderPosition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `priceHistory`
--

DROP TABLE IF EXISTS `priceHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `priceHistory` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `changed` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `workerID` bigint unsigned NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`id`,`changed`),
  KEY `pricehistory_workerid_foreign` (`workerID`),
  CONSTRAINT `pricehistory_id_foreign` FOREIGN KEY (`id`) REFERENCES `product` (`id`),
  CONSTRAINT `pricehistory_workerid_foreign` FOREIGN KEY (`workerID`) REFERENCES `worker` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `priceHistory`
--

LOCK TABLES `priceHistory` WRITE;
/*!40000 ALTER TABLE `priceHistory` DISABLE KEYS */;
INSERT INTO `priceHistory` VALUES (1,'2024-06-26 20:21:41',1,2499.34),(1,'2024-06-30 16:50:21',1,3000),(9,'2024-06-30 17:08:12',1,1499.99),(9,'2024-07-01 20:18:51',1,299.34),(9,'2024-07-01 20:19:12',1,299.34),(9,'2024-07-01 20:19:47',1,299.34),(9,'2024-07-01 20:19:52',1,299.34),(9,'2024-07-01 20:19:56',1,299.34),(9,'2024-07-01 20:20:10',1,299.34),(10,'2024-06-30 17:42:26',1,1299.99),(10,'2024-07-01 00:33:15',1,799.4),(10,'2024-07-01 00:50:32',1,799.4),(10,'2024-07-01 00:50:40',1,799.4),(10,'2024-07-01 00:51:14',1,799.4),(10,'2024-07-01 00:51:18',1,799.4),(10,'2024-07-01 00:51:21',1,799.4),(10,'2024-07-01 00:51:54',1,799.4),(10,'2024-07-01 00:54:08',1,799.4),(11,'2024-06-30 19:00:33',1,1299.99),(12,'2024-06-30 19:00:57',1,1299.99),(13,'2024-07-01 00:06:10',1,1299.99),(14,'2024-07-01 00:07:12',1,1299.99);
/*!40000 ALTER TABLE `priceHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` tinytext NOT NULL,
  `description` mediumtext NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `showSale` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'test','descTest',1,0),(9,'Кастомная футболка2','Описание второй кастомной футболки',0,0),(10,'Футболка 3','Описание второй футболки',0,0),(11,'Футболка 3','Описание второй футболки',0,0),(12,'Футболка 3','Описание второй футболки',0,0),(13,'Футболка 3','Описание второй футболки',0,0),(14,'Футболка 3','Описание второй футболки',0,0);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `size`
--

DROP TABLE IF EXISTS `size`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `size` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `size`
--

LOCK TABLES `size` WRITE;
/*!40000 ALTER TABLE `size` DISABLE KEYS */;
INSERT INTO `size` VALUES (1,'S'),(2,'M'),(3,'L'),(4,'XS'),(5,'XL');
/*!40000 ALTER TABLE `size` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizes`
--

DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sizes` (
  `productID` bigint unsigned NOT NULL,
  `sizeID` bigint unsigned NOT NULL,
  PRIMARY KEY (`productID`,`sizeID`),
  KEY `sizes_sizeid_foreign` (`sizeID`),
  CONSTRAINT `sizes_productid_foreign` FOREIGN KEY (`productID`) REFERENCES `product` (`id`),
  CONSTRAINT `sizes_sizeid_foreign` FOREIGN KEY (`sizeID`) REFERENCES `size` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizes`
--

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
INSERT INTO `sizes` VALUES (9,2),(10,2),(11,2),(12,2),(13,2),(14,2),(10,5),(11,5),(12,5),(13,5),(14,5);
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statusHistory`
--

DROP TABLE IF EXISTS `statusHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statusHistory` (
  `orderID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `changed` timestamp NOT NULL,
  `workerID` bigint unsigned NOT NULL,
  `statusID` int unsigned NOT NULL,
  PRIMARY KEY (`orderID`,`changed`),
  KEY `statushistory_workerid_foreign` (`workerID`),
  KEY `statushistory_statusid_foreign` (`statusID`),
  CONSTRAINT `statushistory_orderid_foreign` FOREIGN KEY (`orderID`) REFERENCES `order` (`id`),
  CONSTRAINT `statushistory_statusid_foreign` FOREIGN KEY (`statusID`) REFERENCES `statusList` (`id`),
  CONSTRAINT `statushistory_workerid_foreign` FOREIGN KEY (`workerID`) REFERENCES `worker` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statusHistory`
--

LOCK TABLES `statusHistory` WRITE;
/*!40000 ALTER TABLE `statusHistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `statusHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statusList`
--

DROP TABLE IF EXISTS `statusList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statusList` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` tinytext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statusList`
--

LOCK TABLES `statusList` WRITE;
/*!40000 ALTER TABLE `statusList` DISABLE KEYS */;
/*!40000 ALTER TABLE `statusList` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userSecret`
--

DROP TABLE IF EXISTS `userSecret`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userSecret` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `password` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `usersecret_id_foreign` FOREIGN KEY (`id`) REFERENCES `worker` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userSecret`
--

LOCK TABLES `userSecret` WRITE;
/*!40000 ALTER TABLE `userSecret` DISABLE KEYS */;
INSERT INTO `userSecret` VALUES (1,'5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5');
/*!40000 ALTER TABLE `userSecret` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker`
--

DROP TABLE IF EXISTS `worker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `login` tinytext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker`
--

LOCK TABLES `worker` WRITE;
/*!40000 ALTER TABLE `worker` DISABLE KEYS */;
INSERT INTO `worker` VALUES (1,'admin'),(2,'admin');
/*!40000 ALTER TABLE `worker` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'RIGSTShirt'
--

--
-- Dumping routines for database 'RIGSTShirt'
--
/*!50003 DROP FUNCTION IF EXISTS `getPreviousPrice` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`katerina4cat`@`%` FUNCTION `getPreviousPrice`(id BIGINT UNSIGNED) RETURNS float
    DETERMINISTIC
BEGIN
    DECLARE prevPrice FLOAT;

    SELECT price INTO prevPrice
    FROM priceHistory
    WHERE priceHistory.id = id
    ORDER BY changed DESC
    LIMIT 1, 1;

    RETURN prevPrice;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `getPrice` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`katerina4cat`@`%` FUNCTION `getPrice`(id BIGINT UNSIGNED) RETURNS float
    DETERMINISTIC
BEGIN
    DECLARE lastPrice FLOAT;

    SELECT price INTO lastPrice
    FROM priceHistory
    WHERE priceHistory.id = id
    ORDER BY changed DESC
    LIMIT 1;
    IF lastPrice IS NULL THEN
        SET lastPrice = -1;
    END IF;

    RETURN lastPrice;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `getSizes` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`katerina4cat`@`%` FUNCTION `getSizes`(id BIGINT UNSIGNED) RETURNS json
    DETERMINISTIC
BEGIN
    DECLARE result JSON;

    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', s.id, 'title', s.title))
    INTO result
    FROM sizes
    JOIN size s ON s.id = sizes.sizeID
    WHERE sizes.productID = id;

    IF result IS NULL THEN
        SET result = JSON_ARRAY();
    END IF;

    RETURN result;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `register` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`katerina4cat`@`%` PROCEDURE `register`(login TINYTEXT, passwd VARCHAR(256))
BEGIN
	INSERT INTO worker(login) VALUE(login);
    INSERT INTO userSecret(password) VALUE(SHA2(passwd, 256));
    SELECT 1;
END ;;
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

-- Dump completed on 2024-07-19 18:15:48
