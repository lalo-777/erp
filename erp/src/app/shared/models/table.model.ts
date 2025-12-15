export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'badge' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SortInfo {
  field: string;
  direction: 'asc' | 'desc';
}

export interface RowAction {
  type: 'view' | 'edit' | 'delete' | 'custom';
  data: any;
  customAction?: string;
}
