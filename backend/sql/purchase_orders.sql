-- ==============================================================================
-- PURCHASE ORDERS - ALTER TABLE SCRIPT
-- Adds missing fields to existing purchase_orders and purchase_order_items tables
-- ==============================================================================
use erp_development;
-- Add missing fields to purchase_orders table
ALTER TABLE purchase_orders 
ADD (is_active BOOLEAN DEFAULT TRUE ,
index idx_active (is_active));

-- Add missing fields to purchase_order_items table
ALTER TABLE purchase_order_items
ADD(
created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);

-- Note: The following tables and catalogs already exist in the schema:
-- - purchase_orders (with po_number, supplier_id, project_id, po_status_id, etc.)
-- - purchase_order_items (with purchase_order_id, material_id, quantity, unit_price, amount)
-- - suppliers (supplier information table)
-- - cat_purchase_order_statuses (status catalog)

-- Verify purchase order statuses exist
INSERT IGNORE INTO cat_purchase_order_statuses (id, name, alias) VALUES
(1, 'Draft', 'draft'),
(2, 'Pending Approval', 'pending'),
(3, 'Approved', 'approved'),
(4, 'Partially Received', 'partial'),
(5, 'Received', 'received'),
(6, 'Cancelled', 'cancelled');
