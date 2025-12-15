-- ========================================
-- CONTRACTS AUDIT TRIGGER
-- ========================================
-- Tracks changes to contract fields
-- Populates contracts_log table
-- ========================================

USE erp_development;

DROP TRIGGER IF EXISTS trg_contracts_audit;

DELIMITER $$

CREATE TRIGGER trg_contracts_audit
BEFORE UPDATE ON contracts
FOR EACH ROW
BEGIN
    DECLARE v_user_id SMALLINT UNSIGNED;
    DECLARE v_change_date DATETIME;

    -- Get session variables set by application
    SET v_user_id = IFNULL(@user_id, 0);
    SET v_change_date = IFNULL(@change_date, NOW());

    -- Track contract_status_id changes
    IF NOT (OLD.contract_status_id <=> NEW.contract_status_id) THEN
        INSERT INTO contracts_log (contract_table_name, contract_id, contract_column_name, old_value, new_value, user_id, change_date)
        VALUES ('contracts', OLD.id, 'contract_status_id', OLD.contract_status_id, NEW.contract_status_id, v_user_id, v_change_date);
    END IF;

    -- Track contract_amount changes
    IF NOT (OLD.contract_amount <=> NEW.contract_amount) THEN
        INSERT INTO contracts_log (contract_table_name, contract_id, contract_column_name, old_value, new_value, user_id, change_date)
        VALUES ('contracts', OLD.id, 'contract_amount', OLD.contract_amount, NEW.contract_amount, v_user_id, v_change_date);
    END IF;

    -- Track signed_date changes
    IF NOT (OLD.signed_date <=> NEW.signed_date) THEN
        INSERT INTO contracts_log (contract_table_name, contract_id, contract_column_name, old_value, new_value, user_id, change_date)
        VALUES ('contracts', OLD.id, 'signed_date', OLD.signed_date, NEW.signed_date, v_user_id, v_change_date);
    END IF;

    -- Track start_date changes
    IF NOT (OLD.start_date <=> NEW.start_date) THEN
        INSERT INTO contracts_log (contract_table_name, contract_id, contract_column_name, old_value, new_value, user_id, change_date)
        VALUES ('contracts', OLD.id, 'start_date', OLD.start_date, NEW.start_date, v_user_id, v_change_date);
    END IF;

    -- Track end_date changes
    IF NOT (OLD.end_date <=> NEW.end_date) THEN
        INSERT INTO contracts_log (contract_table_name, contract_id, contract_column_name, old_value, new_value, user_id, change_date)
        VALUES ('contracts', OLD.id, 'end_date', OLD.end_date, NEW.end_date, v_user_id, v_change_date);
    END IF;

    -- Update modified tracking
    SET NEW.modified_by = v_user_id;
    SET NEW.modified_date = v_change_date;
END$$

DELIMITER ;
