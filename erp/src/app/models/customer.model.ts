export interface Customer {
  id: number;
  company_name: string;
  rfc?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  city?: string;
  state_id?: number;
  postal_code?: string;
  is_active: boolean;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;

  // Relations
  state_name?: string;
  created_by_name?: string;
}

export interface CustomerListItem {
  id: number;
  company_name: string;
  rfc?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  city?: string;
  state_name?: string;
  is_active: boolean;
}

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  new_this_month: number;
}

export interface PaginatedCustomers {
  success: boolean;
  data: CustomerListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateCustomerRequest {
  company_name: string;
  rfc?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  city?: string;
  state_id?: number;
  postal_code?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  is_active?: boolean;
}
