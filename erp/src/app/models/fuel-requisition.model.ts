export interface FuelRequisition {
  id: number;
  requisition_code: string;
  vehicle_equipment_name: string;
  project_id?: number;
  requisition_date: string;
  fuel_type: 'gasoline' | 'diesel' | 'other';
  quantity_liters: number;
  unit_price: number;
  total_amount: number;
  odometer_reading?: number;
  requisition_status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  approved_by?: number;
  approved_date?: string;
  delivered_date?: string;
  notes?: string;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;
  is_active: boolean;

  // Extended fields from joins
  project_name?: string;
  project_code?: string;
  created_by_name?: string;
  modified_by_name?: string;
  approved_by_name?: string;
}

export interface FuelRequisitionListItem {
  id: number;
  requisition_code: string;
  vehicle_equipment_name: string;
  project_id?: number;
  project_name?: string;
  project_code?: string;
  requisition_date: string;
  fuel_type: 'gasoline' | 'diesel' | 'other';
  fuel_type_label: string;
  quantity_liters: number;
  unit_price: number;
  total_amount: number;
  odometer_reading?: number;
  requisition_status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  requisition_status_label: string;
  requisition_status_color: string;
  is_active: boolean;
}

export interface FuelStats {
  total_requisitions: number;
  total_vehicles: number;
  total_liters: number;
  total_cost: number;
  avg_liters_per_requisition: number;
  avg_unit_price: number;
  pending_amount: number;
  approved_amount: number;
  delivered_amount: number;
  gasoline_liters: number;
  diesel_liters: number;
  other_liters: number;
  top_vehicles: Array<{
    vehicle_equipment_name: string;
    requisition_count: number;
    total_liters: number;
    total_cost: number;
    avg_liters: number;
    fuel_type: string;
  }>;
  fuel_by_project: Array<{
    project_name: string;
    project_code: string;
    requisition_count: number;
    total_liters: number;
    fuel_cost: number;
  }>;
}

export interface ConsumptionReport {
  vehicle_equipment_name: string;
  fuel_type: string;
  requisitions_count: number;
  total_liters: number;
  avg_unit_price: number;
  total_cost: number;
  project_name?: string;
  project_code?: string;
}

export interface ConsumptionReportResponse {
  success: boolean;
  data: ConsumptionReport[];
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface PaginatedFuelRequisitions {
  success: boolean;
  data: FuelRequisition[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateFuelRequisitionRequest {
  vehicle_equipment_name: string;
  project_id?: number;
  requisition_date: string;
  fuel_type: 'gasoline' | 'diesel' | 'other';
  quantity_liters: number;
  unit_price: number;
  odometer_reading?: number;
  notes?: string;
}

export interface UpdateFuelRequisitionRequest extends Partial<CreateFuelRequisitionRequest> {
  requisition_status?: 'pending' | 'approved' | 'delivered' | 'cancelled';
}

export interface FuelRequisitionFilters {
  search?: string;
  project_id?: number;
  requisition_status?: 'pending' | 'approved' | 'delivered' | 'cancelled' | 'all';
  fuel_type?: 'gasoline' | 'diesel' | 'other' | 'all';
  start_date?: string;
  end_date?: string;
}

// Helper function to get requisition status label
export function getRequisitionStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'approved':
      return 'Aprobada';
    case 'delivered':
      return 'Entregada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Desconocido';
  }
}

// Helper function to get requisition status color
export function getRequisitionStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'info';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
}

// Helper function to get fuel type label
export function getFuelTypeLabel(type: string): string {
  switch (type) {
    case 'gasoline':
      return 'Gasolina';
    case 'diesel':
      return 'Diésel';
    case 'other':
      return 'Otro';
    default:
      return 'Desconocido';
  }
}

// Helper function to get fuel type color
export function getFuelTypeColor(type: string): string {
  switch (type) {
    case 'gasoline':
      return 'primary';
    case 'diesel':
      return 'success';
    case 'other':
      return 'secondary';
    default:
      return 'secondary';
  }
}

// Helper function to calculate total amount
export function calculateTotalAmount(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

// Helper function to format liters
export function formatLiters(liters: number): string {
  return `${liters.toFixed(2)} L`;
}
