export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  invoice_type_id: number;
  invoice_status_id: number;
  issue_date: string;
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
  issue_date: string;
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
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {}
