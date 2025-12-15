-- ========================================
-- ERP DATABASE SCHEMA
-- ========================================
-- Database: erp_development
-- Description: Complete ERP system schema with Financial, Projects, and Operations modules
-- Character Set: UTF8MB4 for multilingual support
-- Engine: InnoDB for transaction safety
-- ========================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS erp_development
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE erp_development;

-- ========================================
-- SECTION 1: CATALOG TABLES (cat_*)
-- ========================================
-- These tables store lookup/reference data
-- Pattern: All have id, name, alias fields
-- ========================================

-- ========================================
-- 1. SHARED CATALOGS (User & Person Related)
-- ========================================

CREATE TABLE cat_roles (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_roles (role_name, alias, description) VALUES
('Administrator', 'admin', 'Full system access'),
('Manager', 'manager', 'Departmental management access'),
('Supervisor', 'supervisor', 'Team supervision access'),
('Employee', 'employee', 'Standard employee access'),
('Accountant', 'accountant', 'Financial module access'),
('Project Manager', 'project_mgr', 'Project management access'),
('Warehouse Manager', 'warehouse_mgr', 'Inventory management access');

CREATE TABLE cat_genders (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gender_name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_genders (gender_name, alias) VALUES
('Male', 'male'),
('Female', 'female'),
('Other', 'other'),
('Prefer not to say', 'no_answer');

CREATE TABLE cat_marital_statuses (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    marital_name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_marital_statuses (marital_name, alias) VALUES
('Single', 'single'),
('Married', 'married'),
('Divorced', 'divorced'),
('Widowed', 'widowed');

CREATE TABLE cat_person_titles (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title_name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_person_titles (title_name, alias) VALUES
('Mr.', 'mr'),
('Mrs.', 'mrs'),
('Ms.', 'ms'),
('Dr.', 'dr'),
('Ing.', 'ing'),
('Lic.', 'lic'),
('Arq.', 'arq');

CREATE TABLE cat_nationalities (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_nationalities (country_name, alias) VALUES
('Mexico', 'mex'),
('United States', 'usa'),
('Canada', 'can');

CREATE TABLE cat_states (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nationality_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    state_name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias),
    FOREIGN KEY (nationality_id) REFERENCES cat_nationalities(id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_states (nationality_id, state_name, alias) VALUES
(1, 'Aguascalientes', 'ags'),
(1, 'Baja California', 'bc'),
(1, 'Baja California Sur', 'bcs'),
(1, 'Campeche', 'camp'),
(1, 'Chiapas', 'chis'),
(1, 'Chihuahua', 'chih'),
(1, 'Coahuila', 'coah'),
(1, 'Colima', 'col'),
(1, 'Durango', 'dgo'),
(1, 'Guanajuato', 'gto'),
(1, 'Guerrero', 'gro'),
(1, 'Hidalgo', 'hgo'),
(1, 'Jalisco', 'jal'),
(1, 'México', 'mex'),
(1, 'Michoacán', 'mich'),
(1, 'Morelos', 'mor'),
(1, 'Nayarit', 'nay'),
(1, 'Nuevo León', 'nl'),
(1, 'Oaxaca', 'oax'),
(1, 'Puebla', 'pue'),
(1, 'Querétaro', 'qro'),
(1, 'Quintana Roo', 'qroo'),
(1, 'San Luis Potosí', 'slp'),
(1, 'Sinaloa', 'sin'),
(1, 'Sonora', 'son'),
(1, 'Tabasco', 'tab'),
(1, 'Tamaulipas', 'tamps'),
(1, 'Tlaxcala', 'tlax'),
(1, 'Veracruz', 'ver'),
(1, 'Yucatán', 'yuc'),
(1, 'Zacatecas', 'zac'),
(1, 'Ciudad de México', 'cdmx');

-- ========================================
-- 2. FINANCIAL MODULE CATALOGS
-- ========================================

CREATE TABLE cat_invoice_types (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_invoice_types (name, alias, description) VALUES
('Cash Invoice', 'cash', 'Immediate payment invoice'),
('Credit Invoice', 'credit', 'Payment terms invoice');

CREATE TABLE cat_invoice_statuses (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_invoice_statuses (name, alias, description) VALUES
('Draft', 'draft', 'Invoice in preparation'),
('Sent', 'sent', 'Invoice sent to customer'),
('Paid', 'paid', 'Fully paid invoice'),
('Partial', 'partial', 'Partially paid invoice'),
('Overdue', 'overdue', 'Payment overdue'),
('Cancelled', 'cancelled', 'Cancelled invoice');

CREATE TABLE cat_payment_methods (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_payment_methods (name, alias, description) VALUES
('Cash', 'cash', 'Cash payment'),
('Bank Transfer', 'transfer', 'Electronic bank transfer'),
('Check', 'check', 'Check payment'),
('Credit Card', 'card', 'Credit/debit card payment');

CREATE TABLE cat_payment_statuses (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_payment_statuses (name, alias) VALUES
('Pending', 'pending'),
('Partial', 'partial'),
('Completed', 'completed');

CREATE TABLE cat_expense_categories (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_expense_categories (name, alias, description) VALUES
('Travel', 'travel', 'Travel and transportation expenses'),
('Materials', 'materials', 'Material purchases'),
('Services', 'services', 'Professional services'),
('Meals', 'meals', 'Meals and entertainment'),
('Salaries', 'salaries', 'Salary payments'),
('Other', 'other', 'Other expenses');

CREATE TABLE cat_expense_statuses (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_expense_statuses (name, alias) VALUES
('Pending', 'pending'),
('Approved', 'approved'),
('Rejected', 'rejected'),
('Reimbursed', 'reimbursed');

-- ========================================
-- 3. PROJECT MODULE CATALOGS
-- ========================================

CREATE TABLE cat_project_statuses (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_project_statuses (name, alias, description) VALUES
('Planning', 'planning', 'Project in planning phase'),
('In Progress', 'in_progress', 'Project execution in progress'),
('On Hold', 'on_hold', 'Project temporarily paused'),
('Completed', 'completed', 'Project successfully completed'),
('Cancelled', 'cancelled', 'Project cancelled');

CREATE TABLE cat_project_types (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_project_types (name, alias, description) VALUES
('Construction', 'construction', 'New construction project'),
('Remodeling', 'remodeling', 'Building remodeling'),
('Maintenance', 'maintenance', 'Maintenance project'),
('Infrastructure', 'infrastructure', 'Infrastructure project');

CREATE TABLE cat_project_areas (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_project_areas (name, alias, description) VALUES
('Residential', 'residential', 'Residential construction'),
('Commercial', 'commercial', 'Commercial construction'),
('Industrial', 'industrial', 'Industrial construction'),
('Public', 'public', 'Public infrastructure');

CREATE TABLE cat_contract_types (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_contract_types (name, alias, description) VALUES
('Fixed Price', 'fixed_price', 'Fixed price contract'),
('Time & Materials', 'time_materials', 'Time and materials contract'),
('Unit Price', 'unit_price', 'Unit price contract');

CREATE TABLE cat_contract_statuses (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_contract_statuses (name, alias) VALUES
('Draft', 'draft'),
('Active', 'active'),
('Completed', 'completed'),
('Cancelled', 'cancelled');

CREATE TABLE cat_work_order_types (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_work_order_types (name, alias, description) VALUES
('Installation', 'installation', 'Installation work'),
('Repair', 'repair', 'Repair work'),
('Maintenance', 'maintenance', 'Maintenance work'),
('Inspection', 'inspection', 'Inspection task');

CREATE TABLE cat_work_order_statuses (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_work_order_statuses (name, alias) VALUES
('Open', 'open'),
('Assigned', 'assigned'),
('In Progress', 'in_progress'),
('Completed', 'completed'),
('Cancelled', 'cancelled');

-- ========================================
-- 4. OPERATIONS MODULE CATALOGS
-- ========================================

CREATE TABLE cat_labor_types (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_labor_types (name, alias, description) VALUES
('Worker', 'worker', 'General construction worker'),
('Supervisor', 'supervisor', 'Site supervisor'),
('Specialist', 'specialist', 'Specialized technician'),
('Operator', 'operator', 'Equipment operator');

CREATE TABLE cat_unit_of_measure (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_unit_of_measure (name, alias, abbreviation) VALUES
('Piece', 'piece', 'pcs'),
('Kilogram', 'kilogram', 'kg'),
('Meter', 'meter', 'm'),
('Square Meter', 'square_meter', 'm²'),
('Cubic Meter', 'cubic_meter', 'm³'),
('Liter', 'liter', 'L'),
('Hour', 'hour', 'hr'),
('Box', 'box', 'box'),
('Bag', 'bag', 'bag'),
('Gallon', 'gallon', 'gal');

CREATE TABLE cat_material_categories (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_material_categories (name, alias, description) VALUES
('Cement', 'cement', 'Cement and concrete materials'),
('Steel', 'steel', 'Steel and metal materials'),
('Electrical', 'electrical', 'Electrical materials'),
('Plumbing', 'plumbing', 'Plumbing materials'),
('Paint', 'paint', 'Paint and finishing materials'),
('Wood', 'wood', 'Wood materials'),
('Tools', 'tools', 'Tools and equipment');

CREATE TABLE cat_warehouse_locations (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    address VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_warehouse_locations (name, alias, address) VALUES
('Main Warehouse', 'main', 'Central warehouse location'),
('Site A', 'site_a', 'Construction site A storage'),
('Site B', 'site_b', 'Construction site B storage');

CREATE TABLE cat_transaction_types (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_transaction_types (name, alias, description) VALUES
('Entry', 'entry', 'Material entry to warehouse'),
('Exit', 'exit', 'Material exit from warehouse'),
('Transfer', 'transfer', 'Transfer between locations'),
('Adjustment', 'adjustment', 'Inventory adjustment');

CREATE TABLE cat_supplier_categories (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    description VARCHAR(255),
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_supplier_categories (name, alias, description) VALUES
('Materials', 'materials', 'Construction materials supplier'),
('Equipment', 'equipment', 'Equipment rental/sales'),
('Services', 'services', 'Service provider'),
('Fuel', 'fuel', 'Fuel supplier');

CREATE TABLE cat_purchase_order_statuses (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_purchase_order_statuses (name, alias) VALUES
('Draft', 'draft'),
('Sent', 'sent'),
('Partial', 'partial'),
('Received', 'received'),
('Closed', 'closed'),
('Cancelled', 'cancelled');

CREATE TABLE cat_fuel_types (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_fuel_types (name, alias) VALUES
('Diesel', 'diesel'),
('Gasoline', 'gasoline'),
('LP Gas', 'lp_gas');

-- ========================================
-- 5. ML MODULE CATALOGS
-- ========================================

CREATE TABLE cat_ml_models (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    alias VARCHAR(16) NOT NULL,
    model_type VARCHAR(64) NOT NULL,
    description TEXT,
    UNIQUE KEY (alias)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cat_ml_models (name, alias, model_type, description) VALUES
('Project Cost Prediction', 'cost_pred', 'RandomForestRegressor', 'Predicts project costs based on historical data'),
('Project Duration Prediction', 'duration_pred', 'GradientBoostingRegressor', 'Predicts project duration'),
('Customer Segmentation', 'cust_segment', 'KMeans', 'Segments customers into groups'),
('Employee Turnover Prediction', 'turnover_pred', 'LogisticRegression', 'Predicts employee turnover risk'),
('Inventory Optimization', 'inv_opt', 'ARIMA', 'Optimizes inventory levels');

-- ========================================
-- SECTION 2: USER & AUTHENTICATION TABLES
-- ========================================

CREATE TABLE people (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    person_names VARCHAR(255) NOT NULL,
    last_name1 VARCHAR(255) NOT NULL,
    last_name2 VARCHAR(255) DEFAULT NULL,
    gender_id TINYINT UNSIGNED DEFAULT 1,
    birth_date DATE NOT NULL,
    birth_place VARCHAR(6) DEFAULT NULL,
    person_title_id TINYINT UNSIGNED DEFAULT 1,
    marital_status_id TINYINT UNSIGNED DEFAULT 1,
    rfc VARCHAR(13) NOT NULL,
    curp VARCHAR(18) DEFAULT NULL,
    phone1 VARCHAR(15) DEFAULT NULL,
    phone2 VARCHAR(15) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    nationality_id TINYINT UNSIGNED DEFAULT 1,
    is_active TINYINT DEFAULT 1,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (rfc),
    FOREIGN KEY (gender_id) REFERENCES cat_genders(id),
    FOREIGN KEY (person_title_id) REFERENCES cat_person_titles(id),
    FOREIGN KEY (marital_status_id) REFERENCES cat_marital_statuses(id),
    FOREIGN KEY (nationality_id) REFERENCES cat_nationalities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE users (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    person_id INT UNSIGNED NOT NULL,
    role_id TINYINT UNSIGNED DEFAULT 1,
    email VARCHAR(255) NOT NULL,
    usr_password VARCHAR(150) NOT NULL,
    username VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    usr_active TINYINT(1) DEFAULT 1,
    expiration_date DATETIME DEFAULT NULL,
    is_generic TINYINT(1) DEFAULT 0,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (email),
    CONSTRAINT fk_person_id FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE RESTRICT,
    CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES cat_roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE last_access (
    user_id SMALLINT UNSIGNED PRIMARY KEY,
    login_datetime DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE historical_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id SMALLINT UNSIGNED NOT NULL,
    login_datetime DATETIME NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_login (user_id, login_datetime DESC),
    INDEX idx_login_date (login_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SECTION 3: FINANCIAL MODULE TABLES
-- ========================================

CREATE TABLE customers (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    rfc VARCHAR(13),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(15),
    contact_email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state_id SMALLINT UNSIGNED,
    postal_code VARCHAR(10),
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_company (company_name),
    INDEX idx_rfc (rfc),
    CONSTRAINT fk_customers_state FOREIGN KEY (state_id) REFERENCES cat_states(id),
    CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_customers_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE invoices (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_type_id TINYINT UNSIGNED NOT NULL,
    invoice_status_id TINYINT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    project_id INT UNSIGNED DEFAULT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE DEFAULT NULL,
    subtotal DECIMAL(13,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(13,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(13,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY (invoice_number),
    INDEX idx_customer (customer_id),
    INDEX idx_project (project_id),
    INDEX idx_status (invoice_status_id),
    INDEX idx_date (invoice_date),
    CONSTRAINT fk_invoices_type FOREIGN KEY (invoice_type_id) REFERENCES cat_invoice_types(id),
    CONSTRAINT fk_invoices_status FOREIGN KEY (invoice_status_id) REFERENCES cat_invoice_statuses(id),
    CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_invoices_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE invoice_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT UNSIGNED NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(13,2) NOT NULL,
    amount DECIMAL(13,2) NOT NULL,
    order_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
    INDEX idx_invoice (invoice_id),
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE invoices_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    invoice_table_name VARCHAR(50) NOT NULL,
    invoice_id INT UNSIGNED NOT NULL,
    invoice_column_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    user_id SMALLINT UNSIGNED NOT NULL,
    change_date DATETIME NOT NULL,
    INDEX idx_table_id (invoice_table_name, invoice_id),
    INDEX idx_change_date (change_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE payments (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT UNSIGNED NOT NULL,
    payment_method_id TINYINT UNSIGNED NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(13,2) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_invoice (invoice_id),
    INDEX idx_payment_date (payment_date),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_method FOREIGN KEY (payment_method_id) REFERENCES cat_payment_methods(id),
    CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE accounts_receivable (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    original_amount DECIMAL(13,2) NOT NULL,
    balance DECIMAL(13,2) NOT NULL,
    days_overdue INT DEFAULT 0,
    last_contact_date DATE,
    next_follow_up_date DATE,
    assigned_to SMALLINT UNSIGNED,
    notes TEXT,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_invoice (invoice_id),
    INDEX idx_customer (customer_id),
    INDEX idx_assigned (assigned_to),
    INDEX idx_follow_up (next_follow_up_date),
    CONSTRAINT fk_ar_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ar_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ar_assigned FOREIGN KEY (assigned_to) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE expense_reports (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    report_number VARCHAR(50) NOT NULL,
    employee_id SMALLINT UNSIGNED NOT NULL,
    project_id INT UNSIGNED DEFAULT NULL,
    report_date DATE NOT NULL,
    total_amount DECIMAL(13,2) NOT NULL DEFAULT 0.00,
    status_id TINYINT UNSIGNED NOT NULL,
    approved_by SMALLINT UNSIGNED DEFAULT NULL,
    approval_date DATE DEFAULT NULL,
    notes TEXT,
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (report_number),
    INDEX idx_employee (employee_id),
    INDEX idx_status (status_id),
    CONSTRAINT fk_expense_reports_employee FOREIGN KEY (employee_id) REFERENCES users(id),
    CONSTRAINT fk_expense_reports_status FOREIGN KEY (status_id) REFERENCES cat_expense_statuses(id),
    CONSTRAINT fk_expense_reports_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT fk_expense_reports_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_expense_reports_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE expense_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    expense_report_id INT UNSIGNED NOT NULL,
    expense_category_id TINYINT UNSIGNED NOT NULL,
    description VARCHAR(255) NOT NULL,
    expense_date DATE NOT NULL,
    amount DECIMAL(13,2) NOT NULL,
    receipt_file_id INT UNSIGNED DEFAULT NULL,
    notes TEXT,
    INDEX idx_report (expense_report_id),
    CONSTRAINT fk_expense_items_report FOREIGN KEY (expense_report_id) REFERENCES expense_reports(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_items_category FOREIGN KEY (expense_category_id) REFERENCES cat_expense_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SECTION 4: PROJECT MODULE TABLES
-- ========================================

CREATE TABLE projects (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_number VARCHAR(50) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    project_type_id TINYINT UNSIGNED NOT NULL,
    project_area_id TINYINT UNSIGNED NOT NULL,
    project_status_id TINYINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    estimated_end_date DATE NOT NULL,
    actual_end_date DATE DEFAULT NULL,
    total_budget DECIMAL(13,2) NOT NULL DEFAULT 0.00,
    location_address TEXT,
    location_city VARCHAR(100),
    location_state_id SMALLINT UNSIGNED,
    project_manager_id SMALLINT UNSIGNED NOT NULL,
    description TEXT,
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY (project_number),
    INDEX idx_customer (customer_id),
    INDEX idx_status (project_status_id),
    INDEX idx_manager (project_manager_id),
    CONSTRAINT fk_projects_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_projects_type FOREIGN KEY (project_type_id) REFERENCES cat_project_types(id),
    CONSTRAINT fk_projects_area FOREIGN KEY (project_area_id) REFERENCES cat_project_areas(id),
    CONSTRAINT fk_projects_status FOREIGN KEY (project_status_id) REFERENCES cat_project_statuses(id),
    CONSTRAINT fk_projects_state FOREIGN KEY (location_state_id) REFERENCES cat_states(id),
    CONSTRAINT fk_projects_manager FOREIGN KEY (project_manager_id) REFERENCES users(id),
    CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_projects_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add FK from invoices to projects (referenced earlier)
ALTER TABLE invoices
ADD CONSTRAINT fk_invoices_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Add FK from expense_reports to projects (referenced earlier)
ALTER TABLE expense_reports
ADD CONSTRAINT fk_expense_reports_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

CREATE TABLE projects_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_table_name VARCHAR(50) NOT NULL,
    project_id INT UNSIGNED NOT NULL,
    project_column_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    user_id SMALLINT UNSIGNED NOT NULL,
    change_date DATETIME NOT NULL,
    INDEX idx_table_id (project_table_name, project_id),
    INDEX idx_change_date (change_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE project_progress (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    progress_date DATE NOT NULL,
    physical_progress_percent DECIMAL(5,2) NOT NULL,
    description TEXT,
    reported_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    INDEX idx_date (progress_date),
    CONSTRAINT fk_progress_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_reported_by FOREIGN KEY (reported_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE project_progress_photos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    progress_id INT UNSIGNED NOT NULL,
    file_id INT UNSIGNED NOT NULL,
    caption VARCHAR(255),
    order_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
    INDEX idx_progress (progress_id),
    CONSTRAINT fk_photos_progress FOREIGN KEY (progress_id) REFERENCES project_progress(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE work_orders (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    work_order_number VARCHAR(50) NOT NULL,
    project_id INT UNSIGNED NOT NULL,
    work_order_type_id TINYINT UNSIGNED NOT NULL,
    work_order_status_id TINYINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to SMALLINT UNSIGNED,
    due_date DATE,
    completion_date DATE DEFAULT NULL,
    priority TINYINT UNSIGNED DEFAULT 2 COMMENT '1=Low, 2=Medium, 3=High',
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (work_order_number),
    INDEX idx_project (project_id),
    INDEX idx_assigned (assigned_to),
    INDEX idx_status (work_order_status_id),
    CONSTRAINT fk_work_orders_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_work_orders_type FOREIGN KEY (work_order_type_id) REFERENCES cat_work_order_types(id),
    CONSTRAINT fk_work_orders_status FOREIGN KEY (work_order_status_id) REFERENCES cat_work_order_statuses(id),
    CONSTRAINT fk_work_orders_assigned FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT fk_work_orders_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_work_orders_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE work_orders_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    work_order_table_name VARCHAR(50) NOT NULL,
    work_order_id INT UNSIGNED NOT NULL,
    work_order_column_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    user_id SMALLINT UNSIGNED NOT NULL,
    change_date DATETIME NOT NULL,
    INDEX idx_table_id (work_order_table_name, work_order_id),
    INDEX idx_change_date (change_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contracts (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    contract_number VARCHAR(50) NOT NULL,
    project_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    contract_type_id TINYINT UNSIGNED NOT NULL,
    contract_status_id TINYINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    contract_amount DECIMAL(13,2) NOT NULL,
    terms TEXT,
    signed_date DATE DEFAULT NULL,
    contract_file_id INT UNSIGNED DEFAULT NULL,
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (contract_number),
    INDEX idx_project (project_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (contract_status_id),
    CONSTRAINT fk_contracts_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_contracts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_contracts_type FOREIGN KEY (contract_type_id) REFERENCES cat_contract_types(id),
    CONSTRAINT fk_contracts_status FOREIGN KEY (contract_status_id) REFERENCES cat_contract_statuses(id),
    CONSTRAINT fk_contracts_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_contracts_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contracts_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    contract_table_name VARCHAR(50) NOT NULL,
    contract_id INT UNSIGNED NOT NULL,
    contract_column_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    user_id SMALLINT UNSIGNED NOT NULL,
    change_date DATETIME NOT NULL,
    INDEX idx_table_id (contract_table_name, contract_id),
    INDEX idx_change_date (change_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SECTION 5: OPERATIONS MODULE TABLES
-- ========================================

CREATE TABLE labor_timesheets (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    worker_id SMALLINT UNSIGNED NOT NULL,
    work_date DATE NOT NULL,
    hours_worked DECIMAL(5,2) NOT NULL,
    labor_type_id TINYINT UNSIGNED NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(13,2) NOT NULL,
    productivity_notes TEXT,
    approved_by SMALLINT UNSIGNED DEFAULT NULL,
    created_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    INDEX idx_worker (worker_id),
    INDEX idx_date (work_date),
    CONSTRAINT fk_labor_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_labor_worker FOREIGN KEY (worker_id) REFERENCES users(id),
    CONSTRAINT fk_labor_type FOREIGN KEY (labor_type_id) REFERENCES cat_labor_types(id),
    CONSTRAINT fk_labor_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT fk_labor_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE materials (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    category_id TINYINT UNSIGNED NOT NULL,
    unit_of_measure_id TINYINT UNSIGNED NOT NULL,
    unit_cost DECIMAL(13,2) NOT NULL,
    minimum_stock DECIMAL(10,2) DEFAULT 0,
    current_stock DECIMAL(10,2) DEFAULT 0,
    reorder_point DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY (material_code),
    INDEX idx_category (category_id),
    INDEX idx_name (material_name),
    CONSTRAINT fk_materials_category FOREIGN KEY (category_id) REFERENCES cat_material_categories(id),
    CONSTRAINT fk_materials_uom FOREIGN KEY (unit_of_measure_id) REFERENCES cat_unit_of_measure(id),
    CONSTRAINT fk_materials_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_materials_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE inventory_transactions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    transaction_number VARCHAR(50) NOT NULL,
    material_id INT UNSIGNED NOT NULL,
    transaction_type_id TINYINT UNSIGNED NOT NULL,
    warehouse_location_id TINYINT UNSIGNED NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(13,2) NOT NULL,
    total_value DECIMAL(13,2) NOT NULL,
    project_id INT UNSIGNED DEFAULT NULL,
    purchase_order_id INT UNSIGNED DEFAULT NULL,
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (transaction_number),
    INDEX idx_material (material_id),
    INDEX idx_project (project_id),
    INDEX idx_date (transaction_date),
    CONSTRAINT fk_inventory_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    CONSTRAINT fk_inventory_type FOREIGN KEY (transaction_type_id) REFERENCES cat_transaction_types(id),
    CONSTRAINT fk_inventory_location FOREIGN KEY (warehouse_location_id) REFERENCES cat_warehouse_locations(id),
    CONSTRAINT fk_inventory_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_inventory_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE pre_inventory (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    material_id INT UNSIGNED NOT NULL,
    warehouse_location_id TINYINT UNSIGNED NOT NULL,
    system_quantity DECIMAL(10,2) NOT NULL,
    physical_quantity DECIMAL(10,2) DEFAULT NULL,
    variance DECIMAL(10,2) DEFAULT NULL,
    counted_by SMALLINT UNSIGNED DEFAULT NULL,
    count_date DATE DEFAULT NULL,
    notes TEXT,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_material (material_id),
    INDEX idx_location (warehouse_location_id),
    CONSTRAINT fk_preinv_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    CONSTRAINT fk_preinv_location FOREIGN KEY (warehouse_location_id) REFERENCES cat_warehouse_locations(id),
    CONSTRAINT fk_preinv_counted_by FOREIGN KEY (counted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE warehouse_reorganization (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    material_id INT UNSIGNED NOT NULL,
    from_location_id TINYINT UNSIGNED NOT NULL,
    to_location_id TINYINT UNSIGNED NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    reorganization_date DATE NOT NULL,
    reason TEXT,
    performed_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_material (material_id),
    INDEX idx_date (reorganization_date),
    CONSTRAINT fk_reorg_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reorg_from FOREIGN KEY (from_location_id) REFERENCES cat_warehouse_locations(id),
    CONSTRAINT fk_reorg_to FOREIGN KEY (to_location_id) REFERENCES cat_warehouse_locations(id),
    CONSTRAINT fk_reorg_performed_by FOREIGN KEY (performed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE suppliers (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_category_id TINYINT UNSIGNED NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(15),
    email VARCHAR(255),
    address TEXT,
    payment_terms VARCHAR(100),
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_name (supplier_name),
    CONSTRAINT fk_suppliers_category FOREIGN KEY (supplier_category_id) REFERENCES cat_supplier_categories(id),
    CONSTRAINT fk_suppliers_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_suppliers_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE purchase_orders (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL,
    supplier_id INT UNSIGNED NOT NULL,
    project_id INT UNSIGNED DEFAULT NULL,
    po_status_id TINYINT UNSIGNED NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE DEFAULT NULL,
    subtotal DECIMAL(13,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(13,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(13,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by SMALLINT UNSIGNED NOT NULL,
    modified_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (po_number),
    INDEX idx_supplier (supplier_id),
    INDEX idx_project (project_id),
    INDEX idx_status (po_status_id),
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_po_status FOREIGN KEY (po_status_id) REFERENCES cat_purchase_order_statuses(id),
    CONSTRAINT fk_po_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_po_modified_by FOREIGN KEY (modified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add FK from inventory_transactions to purchase_orders (referenced earlier)
ALTER TABLE inventory_transactions
ADD CONSTRAINT fk_inventory_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL;

CREATE TABLE purchase_order_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT UNSIGNED NOT NULL,
    material_id INT UNSIGNED NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(13,2) NOT NULL,
    amount DECIMAL(13,2) NOT NULL,
    INDEX idx_po (purchase_order_id),
    INDEX idx_material (material_id),
    CONSTRAINT fk_po_items_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_po_items_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE fuel_requisitions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    requisition_number VARCHAR(50) NOT NULL,
    project_id INT UNSIGNED NOT NULL,
    vehicle_id VARCHAR(50),
    fuel_type_id TINYINT UNSIGNED NOT NULL,
    liters DECIMAL(10,2) NOT NULL,
    price_per_liter DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(13,2) NOT NULL,
    odometer_reading INT,
    requisition_date DATE NOT NULL,
    authorized_by SMALLINT UNSIGNED DEFAULT NULL,
    notes TEXT,
    created_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (requisition_number),
    INDEX idx_project (project_id),
    INDEX idx_date (requisition_date),
    CONSTRAINT fk_fuel_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_fuel_type FOREIGN KEY (fuel_type_id) REFERENCES cat_fuel_types(id),
    CONSTRAINT fk_fuel_authorized_by FOREIGN KEY (authorized_by) REFERENCES users(id),
    CONSTRAINT fk_fuel_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SECTION 6: SUPPORT TABLES (Files & Notes)
-- ========================================

CREATE TABLE files (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    foreign_id INT UNSIGNED NOT NULL,
    section_id TINYINT UNSIGNED NOT NULL COMMENT '1=Invoice, 2=Project, 3=Expense, 4=Contract, 5=Progress',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_by SMALLINT UNSIGNED NOT NULL,
    upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_section_foreign (section_id, foreign_id),
    CONSTRAINT fk_files_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add FK from expense_items to files (referenced earlier)
ALTER TABLE expense_items
ADD CONSTRAINT fk_expense_items_file FOREIGN KEY (receipt_file_id) REFERENCES files(id) ON DELETE SET NULL;

-- Add FK from project_progress_photos to files (referenced earlier)
ALTER TABLE project_progress_photos
ADD CONSTRAINT fk_photos_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE;

-- Add FK from contracts to files (referenced earlier)
ALTER TABLE contracts
ADD CONSTRAINT fk_contracts_file FOREIGN KEY (contract_file_id) REFERENCES files(id) ON DELETE SET NULL;

CREATE TABLE notes (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    foreign_id INT UNSIGNED NOT NULL,
    section_id TINYINT UNSIGNED NOT NULL COMMENT '1=Invoice, 2=Project, 3=Customer, 4=Expense',
    note_text TEXT NOT NULL,
    created_by SMALLINT UNSIGNED NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_section_foreign (section_id, foreign_id),
    CONSTRAINT fk_notes_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- SECTION 7: ML PREDICTION TABLES
-- ========================================

CREATE TABLE ml_predictions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    model_id TINYINT UNSIGNED NOT NULL,
    entity_type VARCHAR(50) NOT NULL COMMENT 'project, customer, employee, material',
    entity_id INT UNSIGNED NOT NULL,
    prediction_data JSON,
    confidence_score DECIMAL(5,4),
    prediction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_model (model_id),
    INDEX idx_entity (entity_type, entity_id),
    CONSTRAINT fk_predictions_model FOREIGN KEY (model_id) REFERENCES cat_ml_models(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- END OF SCHEMA
-- ========================================
