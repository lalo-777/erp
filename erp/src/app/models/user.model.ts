export interface User {
  id: number;
  person_id: number;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  is_active: boolean;
  account_expiration_date?: string;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;

  // Person data
  person?: {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    second_last_name?: string;
    full_name?: string;
    rfc?: string;
    curp?: string;
    nss?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
}

// User Management Interfaces
export interface UserListItem {
  id: number;
  person_id: number;
  role_id: number;
  email: string;
  username: string;
  lastname: string;
  usr_active: number;
  expiration_date?: string;
  created: string;
  role_name?: string;
  person_names?: string;
  last_name1?: string;
  last_name2?: string;
}

export interface UserDetail {
  id: number;
  person_id: number;
  role_id: number;
  email: string;
  username: string;
  lastname: string;
  usr_active: number;
  expiration_date?: string;
  is_generic: number;
  created: string;
  modified: string;
  role_name?: string;
  person_names?: string;
  last_name1?: string;
  last_name2?: string;
  phone1?: string;
  phone2?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  generic_users: number;
  new_this_month: number;
  by_role: RoleStats[];
}

export interface RoleStats {
  role_name: string;
  user_count: number;
}

export interface PaginatedUsers {
  success: boolean;
  data: UserListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateUserRequest {
  person_id: number;
  role_id: number;
  email: string;
  usr_password: string;
  username: string;
  lastname: string;
  usr_active?: number;
  expiration_date?: string;
  is_generic?: number;
}

export interface UpdateUserRequest {
  person_id?: number;
  role_id?: number;
  email?: string;
  usr_password?: string;
  username?: string;
  lastname?: string;
  usr_active?: number;
  expiration_date?: string;
  is_generic?: number;
}
