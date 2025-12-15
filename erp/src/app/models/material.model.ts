export interface Material {
  id: number;
  material_code: string;
  material_name: string;
  material_category_id?: number;
  description?: string;
  unit_of_measure_id?: number;
  unit_price?: number;
  current_stock: number;
  minimum_stock?: number;
  maximum_stock?: number;
  warehouse_location_id?: number;
  is_active: boolean;
  created_by: number;
  modified_by: number;
  created_date: string;
  modified_date: string;

  // Relations
  material_category?: {
    id: number;
    name: string;
  };
  unit_of_measure?: {
    id: number;
    name: string;
  };
  warehouse_location?: {
    id: number;
    name: string;
  };
}

export interface MaterialListItem {
  id: number;
  material_code: string;
  material_name: string;
  category_name: string;
  unit_of_measure: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  warehouse_location: string;
  is_active: boolean;
}

export interface MaterialStats {
  total_materials: number;
  active_materials: number;
  low_stock_items: number;
  total_inventory_value: number;
  by_category: Array<{
    category_name: string;
    count: number;
  }>;
}

export interface PaginatedMaterials {
  success: boolean;
  data: MaterialListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateMaterialRequest {
  material_name: string;
  material_category_id?: number;
  description?: string;
  unit_of_measure_id?: number;
  unit_price?: number;
  current_stock: number;
  minimum_stock?: number;
  maximum_stock?: number;
  warehouse_location_id?: number;
}

export interface UpdateMaterialRequest extends Partial<CreateMaterialRequest> {}
