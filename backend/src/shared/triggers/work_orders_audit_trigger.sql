-- ========================================
-- WORK ORDERS AUDIT TRIGGER
-- ========================================
-- Tracks changes to work order fields
-- Populates work_orders_log table
-- ========================================

USE erp_development;

DROP TRIGGER IF EXISTS trg_work_orders_audit;

DELIMITER $$

CREATE TRIGGER trg_work_orders_audit
BEFORE UPDATE ON work_orders
FOR EACH ROW
BEGIN
    DECLARE v_user_id SMALLINT UNSIGNED;
    DECLARE v_change_date DATETIME;

    -- Get session variables set by application
    SET v_user_id = IFNULL(@user_id, 0);
    SET v_change_date = IFNULL(@change_date, NOW());

    -- Track work_order_status_id changes
    IF NOT (OLD.work_order_status_id <=> NEW.work_order_status_id) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'work_order_status_id', OLD.work_order_status_id, NEW.work_order_status_id, v_user_id, v_change_date);
    END IF;

    -- Track assigned_to changes
    IF NOT (OLD.assigned_to <=> NEW.assigned_to) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'assigned_to', OLD.assigned_to, NEW.assigned_to, v_user_id, v_change_date);
    END IF;

    -- Track completion_date changes
    IF NOT (OLD.completion_date <=> NEW.completion_date) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'completion_date', OLD.completion_date, NEW.completion_date, v_user_id, v_change_date);
    END IF;

    -- Track due_date changes
    IF NOT (OLD.due_date <=> NEW.due_date) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'due_date', OLD.due_date, NEW.due_date, v_user_id, v_change_date);
    END IF;

    -- Track priority changes
    IF NOT (OLD.priority <=> NEW.priority) THEN
        INSERT INTO work_orders_log (work_order_table_name, work_order_id, work_order_column_name, old_value, new_value, user_id, change_date)
        VALUES ('work_orders', OLD.id, 'priority', OLD.priority, NEW.priority, v_user_id, v_change_date);
    END IF;

    -- Update modified tracking
    SET NEW.modified_by = v_user_id;
    SET NEW.modified_date = v_change_date;
END$$

DELIMITER ;
