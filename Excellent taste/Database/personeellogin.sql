-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 17, 2025 at 01:59 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `personeellogin`
--

-- --------------------------------------------------------

--
-- Table structure for table `bestellingen`
--

CREATE TABLE `bestellingen` (
  `id` int(10) UNSIGNED NOT NULL,
  `menu_id` int(255) NOT NULL,
  `aantal` int(255) NOT NULL,
  `besteld_op` date NOT NULL,
  `klant_email` varchar(255) NOT NULL,
  `tafel` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bestellingen`
--

INSERT INTO `bestellingen` (`id`, `menu_id`, `aantal`, `besteld_op`, `klant_email`, `tafel`) VALUES
(1, 4, 1, '2025-09-17', 'jopzinzen@icloud.com', 1),
(2, 5, 1, '2025-09-17', 'jopzinzen@icloud.com', 1),
(3, 4, 1, '2025-09-17', 'jopzinzen@icloud.com', 1);

-- --------------------------------------------------------

--
-- Table structure for table `bestelling_regels`
--

CREATE TABLE `bestelling_regels` (
  `id` int(10) UNSIGNED NOT NULL,
  `bestelling_id` int(10) UNSIGNED NOT NULL,
  `menu_id` int(10) UNSIGNED NOT NULL,
  `naam` varchar(100) NOT NULL,
  `aantal` int(11) NOT NULL,
  `stuks_prijs` decimal(10,2) NOT NULL,
  `afdeling` enum('bar','keuken') NOT NULL,
  `status` enum('open','in_behandeling','gereed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bestel_wachtwoord`
--

CREATE TABLE `bestel_wachtwoord` (
  `id` tinyint(4) NOT NULL DEFAULT 1,
  `code` varchar(32) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bestel_wachtwoord`
--

INSERT INTO `bestel_wachtwoord` (`id`, `code`, `updated_at`) VALUES
(1, 'ET2025', '2025-09-16 13:26:24');

-- --------------------------------------------------------

--
-- Table structure for table `klanten`
--

CREATE TABLE `klanten` (
  `id` int(11) NOT NULL,
  `naam` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `wachtwoord` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `klanten`
--

INSERT INTO `klanten` (`id`, `naam`, `email`, `wachtwoord`) VALUES
(3, 'jop', 'jopzinzen@icloud.com', '$2y$10$IcATjnSVZd8Qsj3SNWFllOxyFV4X9rtM5h7adU7rbEz1L0XHjiTS2');

-- --------------------------------------------------------

--
-- Table structure for table `menu_categorien`
--

CREATE TABLE `menu_categorien` (
  `id` int(11) NOT NULL,
  `naam` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `naam` varchar(100) NOT NULL,
  `beschrijving` text DEFAULT NULL,
  `prijs` decimal(10,2) NOT NULL CHECK (`prijs` >= 0),
  `categorie` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `naam`, `beschrijving`, `prijs`, `categorie`) VALUES
(4, 'cola', 'coca cola', 2.50, 'koudedrank'),
(5, 'friet', '', 2.50, 'voorgerecht');

-- --------------------------------------------------------

--
-- Table structure for table `no_show`
--

CREATE TABLE `no_show` (
  `id` int(11) NOT NULL,
  `klant_id` int(11) DEFAULT NULL,
  `personeel_id` int(11) DEFAULT NULL,
  `datum` datetime NOT NULL DEFAULT current_timestamp(),
  `reden` varchar(255) DEFAULT NULL,
  `status` enum('open','behandeld') DEFAULT 'open',
  `tijd` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reserveringen`
--

CREATE TABLE `reserveringen` (
  `id` int(11) NOT NULL,
  `naam` varchar(100) NOT NULL,
  `datum` date NOT NULL,
  `tijd` time NOT NULL,
  `personen` int(11) NOT NULL CHECK (`personen` > 0),
  `tafel` varchar(20) NOT NULL,
  `klant_email` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reserveringen`
--

INSERT INTO `reserveringen` (`id`, `naam`, `datum`, `tijd`, `personen`, `tafel`, `klant_email`, `created_at`) VALUES
(2, 'jop', '2025-09-17', '13:45:00', 3, '1', 'jopzinzen@icloud.com', '2025-09-15 11:29:19');

-- --------------------------------------------------------

--
-- Table structure for table `tafels`
--

CREATE TABLE `tafels` (
  `id` int(11) NOT NULL,
  `nummer` int(11) NOT NULL,
  `capaciteit` int(11) NOT NULL,
  `left_px` int(10) UNSIGNED DEFAULT NULL,
  `top_px` int(10) UNSIGNED DEFAULT NULL,
  `locatie` varchar(50) DEFAULT NULL,
  `status` enum('vrij','bezet','gereserveerd') DEFAULT 'vrij'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tafels`
--

INSERT INTO `tafels` (`id`, `nummer`, `capaciteit`, `left_px`, `top_px`, `locatie`, `status`) VALUES
(2, 1, 0, 277, 145, NULL, 'vrij'),
(4, 2, 0, 268, 287, NULL, 'vrij');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','medewerker') DEFAULT 'medewerker',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'Jop', 'Ikdoeveelwerk', 'medewerker', '2025-09-10 11:34:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bestellingen`
--
ALTER TABLE `bestellingen`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bestelling_regels`
--
ALTER TABLE `bestelling_regels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bestelling_id` (`bestelling_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `bestel_wachtwoord`
--
ALTER TABLE `bestel_wachtwoord`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `klanten`
--
ALTER TABLE `klanten`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `menu_categorien`
--
ALTER TABLE `menu_categorien`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `naam` (`naam`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categorie` (`categorie`);

--
-- Indexes for table `no_show`
--
ALTER TABLE `no_show`
  ADD PRIMARY KEY (`id`),
  ADD KEY `klant_id` (`klant_id`),
  ADD KEY `personeel_id` (`personeel_id`);

--
-- Indexes for table `reserveringen`
--
ALTER TABLE `reserveringen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `datum` (`datum`,`tijd`,`tafel`);

--
-- Indexes for table `tafels`
--
ALTER TABLE `tafels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nummer` (`nummer`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bestellingen`
--
ALTER TABLE `bestellingen`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bestelling_regels`
--
ALTER TABLE `bestelling_regels`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `klanten`
--
ALTER TABLE `klanten`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `menu_categorien`
--
ALTER TABLE `menu_categorien`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `no_show`
--
ALTER TABLE `no_show`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reserveringen`
--
ALTER TABLE `reserveringen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tafels`
--
ALTER TABLE `tafels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bestelling_regels`
--
ALTER TABLE `bestelling_regels`
  ADD CONSTRAINT `fk_regels_bestellingen` FOREIGN KEY (`bestelling_id`) REFERENCES `bestellingen` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_regels_menu` FOREIGN KEY (`menu_id`) REFERENCES `menu_items` (`id`);

--
-- Constraints for table `no_show`
--
ALTER TABLE `no_show`
  ADD CONSTRAINT `no_show_ibfk_1` FOREIGN KEY (`klant_id`) REFERENCES `klanten` (`id`),
  ADD CONSTRAINT `no_show_ibfk_2` FOREIGN KEY (`personeel_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
