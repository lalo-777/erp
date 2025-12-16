-- Create labor_timesheets table for tracking worker timesheets
use erp_development;
CREATE TABLE IF NOT EXISTS labor_timesheets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  timesheet_code VARCHAR(50) NOT NULL UNIQUE,
  worker_name VARCHAR(255) NOT NULL,
  project_id INT UNSIGNED NULL,
  work_date DATE NOT NULL,
  hours_worked DECIMAL(5, 2) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  performance_score DECIMAL(3, 2) NULL COMMENT 'Performance score from 0 to 10',
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('pending', 'approved', 'paid') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_by SMALLINT UNSIGNED NOT NULL,
  modified_by SMALLINT UNSIGNED NOT NULL,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  INDEX idx_worker_name (worker_name),
  INDEX idx_project_id (project_id),
  INDEX idx_work_date (work_date),
  INDEX idx_payment_status (payment_status),
  INDEX idx_is_active (is_active),

  CONSTRAINT fk_labor_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  CONSTRAINT fk_labor_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_labor_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for timesheet code lookup
CREATE INDEX idx_timesheet_code ON labor_timesheets(timesheet_code);

-- Insert sample data (optional)
-- INSERT INTO labor_timesheets (timesheet_code, worker_name, project_id, work_date, hours_worked, hourly_rate, payment_amount, created_by, modified_by)
-- VALUES
--   ('TS-000001', 'Juan Pérez', 1, '2025-12-15', 8.00, 150.00, 1200.00, 1, 1),
--   ('TS-000002', 'María García', 1, '2025-12-15', 8.00, 175.00, 1400.00, 1, 1),
--   ('TS-000003', 'Carlos López', 2, '2025-12-15', 6.00, 160.00, 960.00, 1, 1);
