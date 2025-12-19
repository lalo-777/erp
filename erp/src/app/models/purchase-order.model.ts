export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  project_id?: number;
  po_status_id: number;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;
  is_active: boolean;

  // Extended fields from joins
  supplier_name?: string;
  supplier_contact?: string;
  supplier_phone?: string;
  supplier_email?: string;
  status_name?: string;
  status_alias?: string;
  created_by_name?: string;
  modified_by_name?: string;
  items_count?: number;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  material_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  received_quantity: number;
  created_date: string;

  // Extended fields from joins
  material_code?: string;
  material_name?: string;
  unit_of_measure?: string;
  category_name?: string;
}

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
}

export interface PurchaseOrderListItem {
  id: number;
  po_number: string;
  supplier_name?: string;
  order_date: string;
  expected_delivery_date?: string;
  po_status_id: number;
  status_name?: string;
  status_alias?: string;
  status_label: string;
  status_color: string;
  total_amount: number;
  items_count?: number;
  is_active: boolean;
}

export interface PurchaseOrderStats {
  total_orders: number;
  draft: number;
  pending_approval: number;
  approved: number;
  partially_received: number;
  received: number;
  cancelled: number;
  total_amount: number;
  approved_amount: number;
}

export interface PaginatedPurchaseOrders {
  success: boolean;
  data: PurchaseOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreatePurchaseOrderRequest {
  supplier_id: number;
  project_id?: number;
  order_date: string;
  expected_delivery_date?: string;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}

export interface CreatePurchaseOrderItemRequest {
  material_id: number;
  quantity: number;
  unit_price: number;
}

export interface UpdatePurchaseOrderRequest extends Partial<CreatePurchaseOrderRequest> {}

export interface PurchaseOrderFilters {
  search?: string;
  status_id?: number | 'all';
  start_date?: string;
  end_date?: string;
}

export interface ReceiveMaterialsRequest {
  items: Array<{
    item_id: number;
    received_quantity: number;
  }>;
}

export interface PurchaseOrderStatus {
  id: number;
  name: string;
  alias: string;
}

// Helper function to get purchase order status label
export function getPurchaseOrderStatusLabel(statusAlias: string): string {
  switch (statusAlias) {
    case 'draft':
      return 'Borrador';
    case 'pending':
      return 'Pendiente de Aprobación';
    case 'approved':
      return 'Aprobado';
    case 'partial':
      return 'Parcialmente Recibido';
    case 'received':
      return 'Recibido';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
}

// Helper function to get purchase order status color
export function getPurchaseOrderStatusColor(statusAlias: string): string {
  switch (statusAlias) {
    case 'draft':
      return 'secondary';
    case 'pending':
      return 'warning';
    case 'approved':
      return 'info';
    case 'partial':
      return 'primary';
    case 'received':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}

// Helper function to calculate item amount
export function calculateItemAmount(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

// Helper function to calculate order totals
export function calculateOrderTotals(items: CreatePurchaseOrderItemRequest[]): {
  subtotal: number;
  tax_amount: number;
  total_amount: number;
} {
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemAmount(item.quantity, item.unit_price);
  }, 0);

  const tax_amount = subtotal * 0.16; // 16% IVA
  const total_amount = subtotal + tax_amount;

  return { subtotal, tax_amount, total_amount };
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

// Helper function to check if item is fully received
export function isItemFullyReceived(item: PurchaseOrderItem): boolean {
  return item.received_quantity >= item.quantity;
}

// Helper function to check if order can be edited
export function canEditPurchaseOrder(statusId: number): boolean {
  return statusId <= 2; // Draft or Pending
}

// Helper function to check if order can be approved
export function canApprovePurchaseOrder(statusId: number): boolean {
  return statusId === 2; // Pending
}

// Helper function to check if materials can be received
export function canReceiveMaterials(statusId: number): boolean {
  return statusId >= 3 && statusId <= 4; // Approved or Partially Received
}
