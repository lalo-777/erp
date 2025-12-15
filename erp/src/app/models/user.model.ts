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
