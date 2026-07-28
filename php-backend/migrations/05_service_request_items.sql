CREATE TABLE IF NOT EXISTS `service_request_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `service_request_id` INT UNSIGNED NOT NULL,
  `category` ENUM('banner','billboard','urban_advertising','poster','brochure','catalog','sticker','signage','graphic_design','other') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `width` DECIMAL(10,2) DEFAULT NULL,
  `height` DECIMAL(10,2) DEFAULT NULL,
  `dimension_unit` ENUM('cm','m') NOT NULL DEFAULT 'cm',
  `material` VARCHAR(255) DEFAULT NULL,
  `installation_location` VARCHAR(255) DEFAULT NULL,
  `installation_address` TEXT DEFAULT NULL,
  `requires_permit` TINYINT(1) NOT NULL DEFAULT 0,
  `requires_installation_team` TINYINT(1) NOT NULL DEFAULT 0,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`service_request_id`) REFERENCES `service_requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
