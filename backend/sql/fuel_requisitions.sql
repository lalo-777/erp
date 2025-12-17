-- Create fuel_requisitions table for tracking fuel requisitions for vehicles and equipment
use erp_development;
CREATE TABLE IF NOT EXISTS fuel_requisitions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  requisition_code VARCHAR(50) NOT NULL UNIQUE,
  vehicle_equipment_name VARCHAR(255) NOT NULL,
  project_id INT UNSIGNED NULL,
  requisition_date DATE NOT NULL,
  fuel_type ENUM('gasoline', 'diesel', 'other') NOT NULL,
  quantity_liters DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  odometer_reading INT UNSIGNED NULL COMMENT 'Odometer reading at time of requisition',
  requisition_status ENUM('pending', 'approved', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  approved_by SMALLINT UNSIGNED NULL,
  approved_date DATETIME NULL,
  delivered_date DATETIME NULL,
  notes TEXT NULL,
  created_by SMALLINT UNSIGNED NOT NULL,
  modified_by SMALLINT UNSIGNED NOT NULL,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  INDEX idx_vehicle_equipment (vehicle_equipment_name),
  INDEX idx_project_id (project_id),
  INDEX idx_requisition_date (requisition_date),
  INDEX idx_requisition_status (requisition_status),
  INDEX idx_fuel_type (fuel_type),
  INDEX idx_is_active (is_active),

  CONSTRAINT fk_fuel_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  CONSTRAINT fk_fuel_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_fuel_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_fuel_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for requisition code lookup
CREATE INDEX idx_requisition_code ON fuel_requisitions(requisition_code);

-- Insert sample data (optional)
-- INSERT INTO fuel_requisitions (requisition_code, vehicle_equipment_name, project_id, requisition_date, fuel_type, quantity_liters, unit_price, total_amount, odometer_reading, created_by, modified_by)
-- VALUES
--   ('FR-000001', 'Camión Volvo FH16', 1, '2025-12-15', 'diesel', 100.00, 24.50, 2450.00, 45230, 1, 1),
--   ('FR-000002', 'Excavadora CAT 320D', 1, '2025-12-15', 'diesel', 80.00, 24.50, 1960.00, NULL, 1, 1),
--   ('FR-000003', 'Camioneta Toyota Hilux', 2, '2025-12-16', 'gasoline', 50.00, 22.00, 1100.00, 87654, 1, 1);
