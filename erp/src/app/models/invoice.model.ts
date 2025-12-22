export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  invoice_type_id: number;
  invoice_status_id: number;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
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
    email?: string;
  };
  invoice_type?: {
    id: number;
    name: string;
  };
  invoice_status?: {
    id: number;
    name: string;
  };
}

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  customer_name: string;
  invoice_type: string;
  invoice_status: string;
  invoice_status_id: number;
  invoice_date: string;
  due_date: string;
  total: number;
  is_active: boolean;
}

export interface InvoiceStats {
  total_invoices: number;
  total_amount: number;
  paid_invoices: number;
  paid_amount: number;
  pending_invoices: number;
  pending_amount: number;
  overdue_invoices: number;
  overdue_amount: number;
}

export interface PaginatedInvoices {
  success: boolean;
  data: InvoiceListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateInvoiceRequest {
  customer_id: number;
  invoice_type_id: number;
  invoice_status_id: number;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  items?: InvoiceItem[];
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  order_index?: number;
}

export interface InvoiceFilters {
  search?: string;
  customer_id?: number;
  invoice_type_id?: number;
  invoice_status_id?: number;
  invoice_date_from?: string;
  invoice_date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface InvoiceHistoryEntry {
  id: number;
  invoice_table_name: string;
  invoice_id: number;
  invoice_column_name: string;
  old_value: string | null;
  new_value: string | null;
  user_id: number;
  change_date: string;
  changed_by_name?: string;
}
