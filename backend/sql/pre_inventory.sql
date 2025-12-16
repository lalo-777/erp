CREATE TABLE IF NOT EXISTS pre_inventory (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pre_inventory_number VARCHAR(50) NOT NULL UNIQUE,
  material_id INT UNSIGNED NOT NULL,
  warehouse_location_id TINYINT UNSIGNED NOT NULL,
  expected_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  counted_quantity DECIMAL(10, 2) DEFAULT NULL,
  discrepancy DECIMAL(10, 2) DEFAULT NULL,
  unit_cost DECIMAL(13, 2) NOT NULL DEFAULT 0.00,
  discrepancy_value DECIMAL(13, 2) DEFAULT NULL,
  status_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
  notes TEXT,
  count_date DATE NOT NULL,
  counted_by SMALLINT UNSIGNED,
  adjusted TINYINT(1) NOT NULL DEFAULT 0,
  adjustment_transaction_id INT UNSIGNED,
  created_by SMALLINT UNSIGNED NOT NULL,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by SMALLINT UNSIGNED,
  updated_date TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_preinv_material FOREIGN KEY (material_id) REFERENCES materials(id),
  CONSTRAINT fk_preinv_location FOREIGN KEY (warehouse_location_id) REFERENCES cat_warehouse_locations(id),
  CONSTRAINT fk_preinv_counted_by FOREIGN KEY (counted_by) REFERENCES users(id),
  CONSTRAINT fk_preinv_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_preinv_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
  CONSTRAINT fk_preinv_adjustment FOREIGN KEY (adjustment_transaction_id) REFERENCES inventory_transactions(id),

  INDEX idx_preinv_material (material_id),
  INDEX idx_preinv_location (warehouse_location_id),
  INDEX idx_preinv_status (status_id),
  INDEX idx_preinv_count_date (count_date),
  INDEX idx_preinv_adjusted (adjusted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-inventory status catalog
CREATE TABLE IF NOT EXISTS cat_pre_inventory_status (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  status_name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO cat_pre_inventory_status (id, status_name, description) VALUES
(1, 'Pending', 'Physical count not yet performed'),
(2, 'Counted', 'Physical count completed'),
(3, 'Adjusted', 'Discrepancy adjusted in inventory'),
(4, 'Cancelled', 'Count cancelled or invalid')
ON DUPLICATE KEY UPDATE status_name = VALUES(status_name);
