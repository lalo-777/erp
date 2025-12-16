export interface Project {
  id: number;
  project_number: string;
  project_name: string;
  customer_id: number;
  project_type_id: number;
  project_area_id: number;
  project_status_id: number;
  project_manager_id: number;
  start_date: string;
  estimated_end_date: string;
  actual_end_date?: string;
  total_budget: number;
  location_address?: string;
  location_city?: string;
  location_state_id?: number;
  description?: string;
  is_active: boolean;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;

  // Extended fields from backend joins
  company_name?: string;
  customer_rfc?: string;
  customer_email?: string;
  customer_phone?: string;
  project_type_name?: string;
  status_name?: string;
  status_alias?: string;
  area_name?: string;
  state_name?: string;
  manager_name?: string;
  manager_email?: string;
  created_by_name?: string;
  modified_by_name?: string;
}

export interface ProjectListItem {
  id: number;
  project_number: string;
  project_name: string;
  customer_id: number;
  company_name: string;
  project_status_id: number;
  status_name: string;
  status_alias: string;
  project_type_id: number;
  project_type_name: string;
  area_name?: string;
  manager_name?: string;
  start_date: string;
  estimated_end_date?: string;
  total_budget?: number;
  is_active: boolean;
  created_date: string;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  cancelled_projects: number;
  on_hold_projects: number;
  total_estimated_budget: number;
  total_actual_cost: number;
  average_budget: number;
  average_duration_days: number;
  projects_by_type: Array<{
    project_type: string;
    count: number;
    total_budget: number;
  }>;
}

export interface ProjectProgress {
  id: number;
  project_id: number;
  progress_date: string;
  physical_progress_percent: number;
  description?: string;
  reported_by: number;
  created_date: string;
}

export interface ProjectHistoryEntry {
  id: number;
  project_table_name: string;
  project_id: number;
  project_column_name: string;
  old_value?: string;
  new_value?: string;
  user_id: number;
  changed_by_name?: string;
  change_date: string;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
  type?: number;
  area?: number;
  manager?: number;
  customer?: number;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProjects {
  success: boolean;
  data: ProjectListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateProjectRequest {
  customer_id: number;
  project_name: string;
  project_status_id: number;
  project_type_id: number;
  project_area_id: number;
  project_manager_id: number;
  start_date: string;
  estimated_end_date: string;
  total_budget?: number;
  location_address?: string;
  location_city?: string;
  location_state_id?: number;
  description?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  actual_end_date?: string;
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data?: Project;
}
