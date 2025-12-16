export interface Material {
  id: number;
  material_code: string;
  material_name: string;
  category_id: number;
  description?: string;
  unit_of_measure_id: number;
  unit_cost: number;
  current_stock: number;
  minimum_stock: number;
  reorder_point: number;
  is_active: boolean;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;

  // Extended fields from joins
  category_name?: string;
  unit_name?: string;
  unit_alias?: string;
  created_by_name?: string;
  modified_by_name?: string;
}

export interface MaterialListItem {
  id: number;
  material_code: string;
  material_name: string;
  category_id: number;
  category_name: string;
  unit_of_measure_id: number;
  unit_name: string;
  unit_alias?: string;
  unit_cost: number;
  current_stock: number;
  minimum_stock: number;
  reorder_point: number;
  total_value: number; // current_stock * unit_cost
  stock_status: 'out_of_stock' | 'critical' | 'low' | 'adequate';
  is_active: boolean;
}

export interface MaterialStats {
  total_materials: number;
  total_inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  average_stock_level: number;
  materials_by_category: Array<{
    category_name: string;
    count: number;
    category_value: number;
  }>;
}

export interface PaginatedMaterials {
  success: boolean;
  data: Material[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateMaterialRequest {
  material_name: string;
  category_id: number;
  description?: string;
  unit_of_measure_id: number;
  unit_cost: number;
  current_stock: number;
  minimum_stock: number;
  reorder_point: number;
}

export interface UpdateMaterialRequest extends Partial<CreateMaterialRequest> {}

export interface MaterialFilters {
  search?: string;
  category_id?: number;
  stock_status?: 'all' | 'low' | 'adequate' | 'out_of_stock';
}

export interface LowStockMaterial extends Material {
  stock_deficit: number;
}

// Helper function to determine stock status
export function getStockStatus(currentStock: number, minimumStock: number): 'out_of_stock' | 'critical' | 'low' | 'adequate' {
  if (currentStock <= 0) {
    return 'out_of_stock';
  } else if (currentStock < minimumStock) {
    return 'critical';
  } else if (currentStock <= minimumStock * 1.2) {
    return 'low';
  } else {
    return 'adequate';
  }
}

// Helper function to get stock status color
export function getStockStatusColor(status: string): string {
  switch (status) {
    case 'out_of_stock':
      return 'danger';
    case 'critical':
      return 'danger';
    case 'low':
      return 'warning';
    case 'adequate':
      return 'success';
    default:
      return 'secondary';
  }
}

// Helper function to get stock status label
export function getStockStatusLabel(status: string): string {
  switch (status) {
    case 'out_of_stock':
      return 'Agotado';
    case 'critical':
      return 'Stock Crítico';
    case 'low':
      return 'Stock Bajo';
    case 'adequate':
      return 'Stock Adecuado';
    default:
      return 'Desconocido';
  }
}
