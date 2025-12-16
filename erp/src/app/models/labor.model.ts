export interface LaborTimesheet {
  id: number;
  timesheet_code: string;
  worker_name: string;
  project_id?: number;
  work_date: string;
  hours_worked: number;
  hourly_rate: number;
  performance_score?: number;
  payment_amount: number;
  payment_status: 'pending' | 'approved' | 'paid';
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
}

export interface LaborTimesheetListItem {
  id: number;
  timesheet_code: string;
  worker_name: string;
  project_id?: number;
  project_name?: string;
  project_code?: string;
  work_date: string;
  hours_worked: number;
  hourly_rate: number;
  performance_score?: number;
  payment_amount: number;
  payment_status: 'pending' | 'approved' | 'paid';
  payment_status_label: string;
  payment_status_color: string;
  is_active: boolean;
}

export interface LaborStats {
  total_timesheets: number;
  total_workers: number;
  total_hours: number;
  total_payroll: number;
  avg_hours_per_day: number;
  avg_performance: number;
  pending_payments: number;
  approved_payments: number;
  paid_amount: number;
  top_workers: Array<{
    worker_name: string;
    timesheet_count: number;
    total_hours: number;
    total_earnings: number;
    avg_performance: number;
  }>;
  labor_by_project: Array<{
    project_name: string;
    project_code: string;
    timesheet_count: number;
    total_hours: number;
    labor_cost: number;
  }>;
}

export interface PayrollReport {
  worker_name: string;
  days_worked: number;
  total_hours: number;
  avg_hourly_rate: number;
  total_payment: number;
  avg_performance: number;
  payment_status: 'pending' | 'approved' | 'paid';
}

export interface PayrollReportResponse {
  success: boolean;
  data: PayrollReport[];
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface PaginatedTimesheets {
  success: boolean;
  data: LaborTimesheet[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateTimesheetRequest {
  worker_name: string;
  project_id?: number;
  work_date: string;
  hours_worked: number;
  hourly_rate: number;
  performance_score?: number;
  notes?: string;
}

export interface UpdateTimesheetRequest extends Partial<CreateTimesheetRequest> {
  payment_status?: 'pending' | 'approved' | 'paid';
}

export interface TimesheetFilters {
  search?: string;
  project_id?: number;
  payment_status?: 'pending' | 'approved' | 'paid' | 'all';
  start_date?: string;
  end_date?: string;
}

// Helper function to get payment status label
export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'approved':
      return 'Aprobado';
    case 'paid':
      return 'Pagado';
    default:
      return 'Desconocido';
  }
}

// Helper function to get payment status color
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'info';
    case 'paid':
      return 'success';
    default:
      return 'secondary';
  }
}

// Helper function to calculate payment amount
export function calculatePaymentAmount(hoursWorked: number, hourlyRate: number): number {
  return hoursWorked * hourlyRate;
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

// Helper function to format hours
export function formatHours(hours: number): string {
  return `${hours.toFixed(2)} hrs`;
}
