export interface Project {
  id: number;
  project_code: string;
  customer_id: number;
  project_name: string;
  project_status_id: number;
  project_type_id: number;
  project_area_id?: number;
  start_date: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  estimated_budget?: number;
  actual_cost?: number;
  project_address?: string;
  project_description?: string;
  notes?: string;
  is_active: boolean;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;

  // Relations
  customer?: {
    id: number;
    name: string;
  };
  project_status?: {
    id: number;
    name: string;
  };
  project_type?: {
    id: number;
    name: string;
  };
}

export interface ProjectListItem {
  id: number;
  project_code: string;
  project_name: string;
  customer_name: string;
  project_status: string;
  project_type: string;
  start_date: string;
  estimated_end_date: string;
  estimated_budget: number;
  actual_cost: number;
  is_active: boolean;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_estimated_budget: number;
  total_actual_cost: number;
  by_status: Array<{
    status_name: string;
    count: number;
  }>;
  by_type: Array<{
    type_name: string;
    count: number;
  }>;
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
  project_area_id?: number;
  start_date: string;
  estimated_end_date?: string;
  estimated_budget?: number;
  project_address?: string;
  project_description?: string;
  notes?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}
