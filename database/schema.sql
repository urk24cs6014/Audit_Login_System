-- =============================================================================
-- ROLE-BASED ACTIVITY AUDIT LOGGING SYSTEM - DATABASE SCHEMA
-- Compatible with MySQL 8.x & MySQL Workbench
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `audit_logging_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `audit_logging_db`;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. DOCUMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT,
  `status` ENUM('DRAFT', 'IN_REVIEW', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `created_by` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_documents_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. AUDIT LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  `resource_type` VARCHAR(50) NOT NULL,
  `resource_id` INT NOT NULL,
  `old_data` JSON DEFAULT NULL,
  `new_data` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_resource_type_id` (`resource_type`, `resource_id`),
  INDEX `idx_timestamp` (`timestamp`),
  INDEX `idx_user_action` (`user_id`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- SEED DATA (INITIAL USERS & SAMPLE DOCUMENTS)
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `role`) VALUES
(1, 'Alice Smith (Admin)', 'alice.admin@company.com', 'ADMIN'),
(2, 'Bob Jones (Member)', 'bob.member@company.com', 'MEMBER'),
(3, 'Charlie Brown (Member)', 'charlie.member@company.com', 'MEMBER');

INSERT INTO `documents` (`id`, `title`, `content`, `status`, `created_by`) VALUES
(1, 'Q3 Cloud Infrastructure Strategy', 'Proposal for migrating core microservices to Kubernetes clusters with automated scaling.', 'PUBLISHED', 1),
(2, 'Role-Based Access Control Spec', 'Detailed specification for RBAC middleware implementation across API gateways.', 'IN_REVIEW', 2),
(3, 'Zero-Trust Security Policies', 'Drafting guidelines for internal API key rotation and mutual TLS verification.', 'DRAFT', 2);

-- Sample initial audit logs
INSERT INTO `audit_logs` (`user_id`, `action`, `resource_type`, `resource_id`, `old_data`, `new_data`, `ip_address`, `timestamp`) VALUES
(1, 'CREATE', 'documents', 1, NULL, JSON_OBJECT('id', 1, 'title', 'Q3 Cloud Infrastructure Strategy', 'status', 'PUBLISHED', 'created_by', 1), '192.168.1.10', NOW() - INTERVAL 2 DAY),
(2, 'CREATE', 'documents', 2, NULL, JSON_OBJECT('id', 2, 'title', 'Role-Based Access Control Spec', 'status', 'DRAFT', 'created_by', 2), '192.168.1.15', NOW() - INTERVAL 1 DAY),
(2, 'UPDATE', 'documents', 2, JSON_OBJECT('id', 2, 'title', 'Role-Based Access Control Spec', 'status', 'DRAFT'), JSON_OBJECT('id', 2, 'title', 'Role-Based Access Control Spec', 'status', 'IN_REVIEW'), '192.168.1.15', NOW() - INTERVAL 4 HOUR);
