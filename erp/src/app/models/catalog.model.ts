export interface CatalogItem {
  id: number;
  name: string;
  alias?: string;
  description?: string;
  is_active?: boolean;
}

export interface CatalogResponse {
  success: boolean;
  data: CatalogItem[];
}
