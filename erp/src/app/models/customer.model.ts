export interface Customer {
  id: number;
  person_id: number;
  is_company: boolean;
  customer_code?: string;
  tax_id?: string;
  business_name?: string;
  trade_name?: string;
  industry?: string;
  website?: string;
  credit_limit?: number;
  payment_terms_days?: number;
  preferred_payment_method_id?: number;
  is_active: boolean;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;

  // Relations
  person?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
}

export interface CustomerListItem {
  id: number;
  customer_code: string;
  name: string;
  tax_id: string;
  email: string;
  phone: string;
  credit_limit: number;
  is_active: boolean;
}

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  total_credit_limit: number;
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
  person_id: number;
  is_company: boolean;
  tax_id?: string;
  business_name?: string;
  trade_name?: string;
  industry?: string;
  website?: string;
  credit_limit?: number;
  payment_terms_days?: number;
  preferred_payment_method_id?: number;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}
