-- ========================================
-- EXPENSE REPORTS AUDIT TRIGGER
-- ========================================
-- Tracks changes to expense report fields
-- Note: No separate expense_reports_log table in schema
-- This trigger only updates modified tracking fields
-- ========================================

USE erp_development;

DROP TRIGGER IF EXISTS trg_expense_reports_audit;

DELIMITER $$

CREATE TRIGGER trg_expense_reports_audit
BEFORE UPDATE ON expense_reports
FOR EACH ROW
BEGIN
    DECLARE v_user_id SMALLINT UNSIGNED;
    DECLARE v_change_date DATETIME;

    -- Get session variables set by application
    SET v_user_id = IFNULL(@user_id, 0);
    SET v_change_date = IFNULL(@change_date, NOW());

    -- Update modified tracking
    SET NEW.modified_by = v_user_id;
    SET NEW.modified_date = v_change_date;
END$$

DELIMITER ;
