-- phpMyAdmin SQL Dump
-- version 3.3.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 30, 2015 at 02:44 PM
-- Server version: 5.1.63
-- PHP Version: 5.3.5-1ubuntu7.11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `taisc`
--

-- --------------------------------------------------------

--
-- Table structure for table `taisc_updates`
--

CREATE TABLE IF NOT EXISTS `taisc_updates` (
  `gid` int(11) NOT NULL,
  `channel` int(11) NOT NULL,
  `last_seq` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  `insert_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`uid`),
  KEY `insert_time` (`insert_time`),
  KEY `channel` (`channel`),
  KEY `gid` (`gid`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;


CREATE USER 'taisc'@'%' IDENTIFIED BY 'taisc';
GRANT USAGE ON * . * TO 'taisc'@'%' IDENTIFIED BY 'taisc' WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0 ;
GRANT ALL PRIVILEGES ON `taisc` . * TO 'taisc'@'%';
