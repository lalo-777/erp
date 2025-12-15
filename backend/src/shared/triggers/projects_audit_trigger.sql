-- ========================================
-- PROJECTS AUDIT TRIGGER
-- ========================================
-- Tracks changes to project fields
-- Populates projects_log table
-- ========================================

USE erp_development;

DROP TRIGGER IF EXISTS trg_projects_audit;

DELIMITER $$

CREATE TRIGGER trg_projects_audit
BEFORE UPDATE ON projects
FOR EACH ROW
BEGIN
    DECLARE v_user_id SMALLINT UNSIGNED;
    DECLARE v_change_date DATETIME;

    -- Get session variables set by application
    SET v_user_id = IFNULL(@user_id, 0);
    SET v_change_date = IFNULL(@change_date, NOW());

    -- Track project_status_id changes
    IF NOT (OLD.project_status_id <=> NEW.project_status_id) THEN
        INSERT INTO projects_log (project_table_name, project_id, project_column_name, old_value, new_value, user_id, change_date)
        VALUES ('projects', OLD.id, 'project_status_id', OLD.project_status_id, NEW.project_status_id, v_user_id, v_change_date);
    END IF;

    -- Track total_budget changes
    IF NOT (OLD.total_budget <=> NEW.total_budget) THEN
        INSERT INTO projects_log (project_table_name, project_id, project_column_name, old_value, new_value, user_id, change_date)
        VALUES ('projects', OLD.id, 'total_budget', OLD.total_budget, NEW.total_budget, v_user_id, v_change_date);
    END IF;

    -- Track estimated_end_date changes
    IF NOT (OLD.estimated_end_date <=> NEW.estimated_end_date) THEN
        INSERT INTO projects_log (project_table_name, project_id, project_column_name, old_value, new_value, user_id, change_date)
        VALUES ('projects', OLD.id, 'estimated_end_date', OLD.estimated_end_date, NEW.estimated_end_date, v_user_id, v_change_date);
    END IF;

    -- Track actual_end_date changes
    IF NOT (OLD.actual_end_date <=> NEW.actual_end_date) THEN
        INSERT INTO projects_log (project_table_name, project_id, project_column_name, old_value, new_value, user_id, change_date)
        VALUES ('projects', OLD.id, 'actual_end_date', OLD.actual_end_date, NEW.actual_end_date, v_user_id, v_change_date);
    END IF;

    -- Track project_manager_id changes
    IF NOT (OLD.project_manager_id <=> NEW.project_manager_id) THEN
        INSERT INTO projects_log (project_table_name, project_id, project_column_name, old_value, new_value, user_id, change_date)
        VALUES ('projects', OLD.id, 'project_manager_id', OLD.project_manager_id, NEW.project_manager_id, v_user_id, v_change_date);
    END IF;

    -- Track project_name changes
    IF NOT (OLD.project_name <=> NEW.project_name) THEN
        INSERT INTO projects_log (project_table_name, project_id, project_column_name, old_value, new_value, user_id, change_date)
        VALUES ('projects', OLD.id, 'project_name', OLD.project_name, NEW.project_name, v_user_id, v_change_date);
    END IF;

    -- Update modified tracking
    SET NEW.modified_by = v_user_id;
    SET NEW.modified_date = v_change_date;
END$$

DELIMITER ;
