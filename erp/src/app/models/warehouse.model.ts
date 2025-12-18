export interface WarehouseLocation {
  id: number;
  name: string;
  alias: string;
  address?: string;
  materials_count?: number;
  total_quantity?: number;
}

export interface InventoryTransaction {
  id: number;
  transaction_number: string;
  material_id: number;
  material_code?: string;
  material_name?: string;
  transaction_type_id: number;
  transaction_type?: string;
  transaction_type_alias?: string;
  warehouse_location_id: number;
  location_name?: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  project_id?: number;
  purchase_order_id?: number;
  reference_number?: string;
  notes?: string;
  transaction_date: string;
  created_by: number;
  created_by_name?: string;
  created_date: string;
}

export interface WarehouseReorganization {
  id: number;
  material_id: number;
  material_code?: string;
  material_name?: string;
  from_location_id: number;
  from_location_name?: string;
  to_location_id: number;
  to_location_name?: string;
  quantity: number;
  reorganization_date: string;
  reason?: string;
  performed_by: number;
  performed_by_name?: string;
  created_date: string;
}

export interface StockByLocation {
  id: number;
  material_code: string;
  material_name: string;
  category_name: string;
  unit_name: string;
  unit_alias: string;
  location_stock: number;
  total_stock: number;
  minimum_stock: number;
  unit_cost: number;
  stock_value?: number;
  stock_status?: string;
  stock_status_label?: string;
  stock_status_color?: string;
}

export interface WarehouseStats {
  total_locations: number;
  total_materials_in_stock: number;
  total_transactions: number;
  total_entries: number;
  total_exits: number;
  total_transfers: number;
  total_adjustments: number;
  total_entries_value: number;
  total_exits_value: number;
  stock_by_location: Array<{
    id: number;
    location_name: string;
    materials_count: number;
    total_quantity: number;
    stock_value: number;
  }>;
}

export interface StockReportItem {
  id: number;
  material_code: string;
  material_name: string;
  category_name: string;
  unit_name: string;
  location_id: number;
  location_name: string;
  location_stock: number;
  total_stock: number;
  minimum_stock: number;
  reorder_point: number;
  unit_cost: number;
  stock_value: number;
}

export interface TransferMaterialRequest {
  material_id: number;
  from_location_id: number;
  to_location_id: number;
  quantity: number;
  reason?: string;
  transfer_date?: string;
}

export interface AdjustInventoryRequest {
  material_id: number;
  warehouse_location_id: number;
  quantity: number;
  transaction_type: 'entry' | 'exit' | 'adjustment';
  reference_number?: string;
  notes?: string;
  transaction_date?: string;
}

export interface PaginatedTransactions {
  success: boolean;
  data: InventoryTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface PaginatedTransfers {
  success: boolean;
  data: WarehouseReorganization[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface TransactionFilters {
  materialId?: number;
  locationId?: number;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface StockReportFilters {
  locationId?: number;
  categoryId?: number;
  lowStock?: boolean;
}

// Helper function to get transaction type color
export function getTransactionTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'entry':
      return 'success';
    case 'exit':
      return 'danger';
    case 'transfer':
      return 'primary';
    case 'adjustment':
      return 'warning';
    default:
      return 'secondary';
  }
}

// Helper function to get transaction type icon (Material Symbols)
export function getTransactionTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'entry':
      return 'arrow_circle_down';
    case 'exit':
      return 'arrow_circle_up';
    case 'transfer':
      return 'swap_horiz';
    case 'adjustment':
      return 'edit_square';
    default:
      return 'help';
  }
}

// Helper function to get transaction type label
export function getTransactionTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case 'entry':
      return 'Entrada';
    case 'exit':
      return 'Salida';
    case 'transfer':
      return 'Transferencia';
    case 'adjustment':
      return 'Ajuste';
    default:
      return 'Desconocido';
  }
}
