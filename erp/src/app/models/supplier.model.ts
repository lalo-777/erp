export interface Supplier {
  id: number;
  supplier_name: string;
  supplier_category_id: number;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;
  is_active: boolean;

  // Extended fields from joins
  category_name?: string;
  created_by_name?: string;
  modified_by_name?: string;
  purchase_orders_count?: number;
  total_purchases?: number;
}

export interface SupplierListItem {
  id: number;
  supplier_name: string;
  supplier_category_id: number;
  category_name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  payment_terms?: string;
  purchase_orders_count: number;
  is_active: boolean;
}

export interface SupplierStats {
  total_suppliers: number;
  suppliers_by_category: Array<{
    category_name: string;
    count: number;
  }>;
  top_suppliers: Array<{
    id: number;
    supplier_name: string;
    total_orders: number;
    total_amount: number;
  }>;
}

export interface SupplierCategory {
  id: number;
  name: string;
  alias: string;
  description?: string;
}

export interface PaginatedSuppliers {
  success: boolean;
  data: Supplier[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateSupplierRequest {
  supplier_name: string;
  supplier_category_id: number;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface SupplierFilters {
  search?: string;
  category_id?: number;
}
