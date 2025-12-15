-- ========================================
-- INVOICES AUDIT TRIGGER
-- ========================================
-- Tracks changes to invoice fields
-- Populates invoices_log table
-- ========================================

USE erp_development;

DROP TRIGGER IF EXISTS trg_invoices_audit;

DELIMITER $$

CREATE TRIGGER trg_invoices_audit
BEFORE UPDATE ON invoices
FOR EACH ROW
BEGIN
    DECLARE v_user_id SMALLINT UNSIGNED;
    DECLARE v_change_date DATETIME;

    -- Get session variables set by application
    SET v_user_id = IFNULL(@user_id, 0);
    SET v_change_date = IFNULL(@change_date, NOW());

    -- Track invoice_status_id changes
    IF NOT (OLD.invoice_status_id <=> NEW.invoice_status_id) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'invoice_status_id', OLD.invoice_status_id, NEW.invoice_status_id, v_user_id, v_change_date);
    END IF;

    -- Track total_amount changes
    IF NOT (OLD.total_amount <=> NEW.total_amount) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'total_amount', OLD.total_amount, NEW.total_amount, v_user_id, v_change_date);
    END IF;

    -- Track subtotal changes
    IF NOT (OLD.subtotal <=> NEW.subtotal) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'subtotal', OLD.subtotal, NEW.subtotal, v_user_id, v_change_date);
    END IF;

    -- Track tax_amount changes
    IF NOT (OLD.tax_amount <=> NEW.tax_amount) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'tax_amount', OLD.tax_amount, NEW.tax_amount, v_user_id, v_change_date);
    END IF;

    -- Track due_date changes
    IF NOT (OLD.due_date <=> NEW.due_date) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'due_date', OLD.due_date, NEW.due_date, v_user_id, v_change_date);
    END IF;

    -- Track customer_id changes
    IF NOT (OLD.customer_id <=> NEW.customer_id) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'customer_id', OLD.customer_id, NEW.customer_id, v_user_id, v_change_date);
    END IF;

    -- Track project_id changes
    IF NOT (OLD.project_id <=> NEW.project_id) THEN
        INSERT INTO invoices_log (invoice_table_name, invoice_id, invoice_column_name, old_value, new_value, user_id, change_date)
        VALUES ('invoices', OLD.id, 'project_id', OLD.project_id, NEW.project_id, v_user_id, v_change_date);
    END IF;

    -- Update modified tracking
    SET NEW.modified_by = v_user_id;
    SET NEW.modified_date = v_change_date;
END$$

DELIMITER ;
