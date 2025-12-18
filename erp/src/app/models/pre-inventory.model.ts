export interface PreInventory {
  id: number;
  pre_inventory_number: string;
  material_id: number;
  material_code?: string;
  material_name?: string;
  category_name?: string;
  unit_name?: string;
  warehouse_location_id: number;
  location_name?: string;
  expected_quantity: number;
  counted_quantity?: number;
  discrepancy?: number;
  unit_cost: number;
  discrepancy_value?: number;
  status_id: number;
  status_name?: string;
  notes?: string;
  count_date: string;
  counted_by?: number;
  counted_by_name?: string;
  adjusted: boolean;
  adjustment_transaction_id?: number;
  adjustment_transaction_number?: string;
  created_by: number;
  created_by_name?: string;
  created_date: string;
  updated_by?: number;
  updated_by_name?: string;
  updated_date?: string;
}

export interface PreInventoryStatus {
  id: number;
  status_name: string;
  description?: string;
  is_active: boolean;
}

export interface CreatePreInventoryRequest {
  material_id: number;
  warehouse_location_id: number;
  count_date?: string;
  notes?: string;
}

export interface UpdatePhysicalCountRequest {
  counted_quantity: number;
  notes?: string;
}

export interface DiscrepancyReportSummary {
  total_counts: number;
  discrepancies_count: number;
  overages: number;
  shortages: number;
  adjustments_processed: number;
  total_discrepancy_value: number;
}

export interface DiscrepancyReportItem {
  id: number;
  pre_inventory_number: string;
  material_id: number;
  material_code: string;
  material_name: string;
  category_name: string;
  location_name: string;
  expected_quantity: number;
  counted_quantity: number;
  discrepancy: number;
  unit_cost: number;
  discrepancy_value: number;
  adjusted: boolean;
  adjustment_transaction_id?: number;
  count_date: string;
  counted_by_name?: string;
}

export interface DiscrepancyReport {
  summary: DiscrepancyReportSummary;
  details: DiscrepancyReportItem[];
}

export interface PreInventoryStats {
  total_counts: number;
  pending_counts: number;
  completed_counts: number;
  adjusted_counts: number;
  with_discrepancies: number;
  overages: number;
  shortages: number;
  total_overage_value: number;
  total_shortage_value: number;
  total_discrepancy_value: number;
  recent_counts: Array<{
    id: number;
    pre_inventory_number: string;
    material_name: string;
    location_name: string;
    discrepancy: number;
    discrepancy_value: number;
    count_date: string;
  }>;
}

export interface PreInventoryFilters {
  materialId?: number;
  locationId?: number;
  statusId?: number;
  adjusted?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DiscrepancyReportFilters {
  locationId?: number;
  startDate?: string;
  endDate?: string;
  onlyDiscrepancies?: boolean;
}

export interface PaginatedPreInventory {
  success: boolean;
  data: PreInventory[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Helper function to get status color
export function getPreInventoryStatusColor(statusId: number): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
  switch (statusId) {
    case 1: // Pending
      return 'warning';
    case 2: // Counted
      return 'info';
    case 3: // Adjusted
      return 'success';
    case 4: // Cancelled
      return 'danger';
    default:
      return 'secondary';
  }
}

// Helper function to get status icon (Material Symbols)
export function getPreInventoryStatusIcon(statusId: number): string {
  switch (statusId) {
    case 1: // Pending
      return 'schedule';
    case 2: // Counted
      return 'check_circle';
    case 3: // Adjusted
      return 'verified';
    case 4: // Cancelled
      return 'cancel';
    default:
      return 'help';
  }
}

// Helper function to get discrepancy color
export function getDiscrepancyColor(discrepancy: number): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'dark' {
  if (discrepancy === 0) return 'success';
  if (discrepancy > 0) return 'primary';
  return 'danger';
}

// Helper function to get discrepancy icon (Material Symbols)
export function getDiscrepancyIcon(discrepancy: number): string {
  if (discrepancy === 0) return 'check_circle';
  if (discrepancy > 0) return 'arrow_circle_up';
  return 'arrow_circle_down';
}

// Helper function to get discrepancy label
export function getDiscrepancyLabel(discrepancy: number): string {
  if (discrepancy === 0) return 'Sin discrepancia';
  if (discrepancy > 0) return 'Sobrante';
  return 'Faltante';
}
