// ML Analytics Models

// Common chart data structure for Chart.js
export interface ChartData {
  type: string;
  data: {
    labels?: string[];
    datasets: ChartDataset[];
  };
  options?: Record<string, any>;
}

export interface ChartDataset {
  label?: string;
  data: any[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean | string;
  tension?: number;
  borderDash?: number[];
  pointRadius?: number;
  pointBackgroundColor?: string;
}

// Project Cost Prediction
export interface ProjectCostInput {
  project_type_id: number;
  area_m2: number;
  num_floors: number;
  location_zone: number;
  complexity_score: number;
  material_quality: number;
  has_basement: boolean;
  has_pool: boolean;
  season_start: number;
  team_size: number;
  manager_experience_years: number;
}

export interface ProjectCostPrediction {
  success: boolean;
  prediction: {
    predicted_cost: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
    confidence_level: number;
  };
  model_info: {
    name: string;
    r2_score: number;
    mae: number;
    rmse: number;
    feature_importance: Record<string, number>;
  };
  chart_data: {
    feature_importance: ChartData;
  };
}

// Project Duration Prediction
export interface ProjectDurationInput {
  project_type_id: number;
  area_m2: number;
  num_floors: number;
  complexity_score: number;
  team_size: number;
  manager_experience_years: number;
  season_start: number;
}

export interface ProjectDurationPrediction {
  success: boolean;
  prediction: {
    predicted_days: number;
    predicted_months: number;
    confidence_interval: {
      lower_days: number;
      upper_days: number;
    };
    confidence_level: number;
    estimated_end_date: string;
  };
  model_info: {
    name: string;
    r2_score: number;
    mae_days: number;
    rmse_days: number;
    feature_importance: Record<string, number>;
  };
  chart_data: {
    feature_importance: ChartData;
    duration_distribution: ChartData;
  };
}

// Customer Segmentation
export interface CustomerSegment {
  segment_id: number;
  name: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
  icon: string;
  characteristics: {
    avg_revenue: number;
    avg_projects: number;
    avg_tenure_months: number;
    avg_payment_delay: number;
    avg_satisfaction: number;
  };
}

export interface CustomerSegmentsAnalysis {
  success: boolean;
  analysis: {
    total_customers: number;
    num_clusters: number;
    silhouette_score: number;
  };
  segments: CustomerSegment[];
  chart_data: {
    segment_distribution: ChartData;
    segment_radar: ChartData;
    cluster_scatter: ChartData;
  };
}

// Employee Turnover
export interface EmployeeTurnoverInput {
  tenure_months: number;
  age: number;
  salary_level: number;
  department: number;
  performance_score: number;
  overtime_hours_monthly: number;
  distance_from_home_km: number;
  num_promotions: number;
  training_hours_yearly: number;
  satisfaction_score: number;
  num_projects_assigned: number;
}

export interface RiskFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  value: number;
  contribution: number;
}

export interface TurnoverPrediction {
  success: boolean;
  prediction: {
    turnover_probability: number;
    risk_level: 'low' | 'medium' | 'high';
    risk_color: string;
    recommendation: string;
  };
  risk_factors: RiskFactor[];
  model_info: {
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    auc_roc: number;
  };
  chart_data: {
    risk_gauge: ChartData;
    factor_contribution: ChartData;
  };
}

export interface TurnoverOverview {
  success: boolean;
  overview: {
    total_employees: number;
    predicted_at_risk: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
    overall_turnover_rate: number;
  };
  chart_data: {
    risk_distribution: ChartData;
    turnover_by_department: ChartData;
  };
}

// Inventory Forecast
export interface InventoryForecastInput {
  material_id: number;
  forecast_days: number;
  current_stock: number;
  reorder_point: number;
  lead_time_days: number;
}

export interface DailyForecast {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  stock_level: number;
}

export interface InventoryForecast {
  success: boolean;
  material: {
    id: number;
    name: string;
    unit: string;
  };
  forecast: {
    predicted_demand_total: number;
    predicted_demand_daily_avg: number;
    days_until_stockout: number | null;
    stockout_date: string | null;
    recommended_order_quantity: number;
    recommended_order_date: string | null;
    safety_stock: number;
  };
  model_info: {
    name: string;
    mape: number;
    mae: number;
  };
  daily_forecast: DailyForecast[];
  chart_data: {
    demand_forecast: ChartData;
    stock_projection: ChartData;
    seasonality_pattern: ChartData;
  };
}

export interface InventoryAlert {
  material_id: number;
  material_name: string;
  alert_type: 'stockout_imminent' | 'low_stock';
  days_until_stockout?: number;
  current_stock_days?: number;
  recommended_action: string;
}

export interface InventoryOverview {
  success: boolean;
  materials_analyzed: number;
  alerts: InventoryAlert[];
  summary: {
    total_inventory_value: number;
    items_below_reorder: number;
    items_at_risk: number;
  };
  materials: {
    material_id: number;
    name: string;
    current_stock: number;
    avg_daily_demand: number;
    stock_days: number;
    unit_cost: number;
  }[];
}

// Dashboard
export interface MLModelStatus {
  name: string;
  model: string;
  status: 'active' | 'inactive';
  accuracy: string;
}

export interface MLDashboard {
  success: boolean;
  models_status: MLModelStatus[];
  chart_data: {
    model_accuracy: ChartData;
  };
}

// Health Check
export interface MLHealthResponse {
  success: boolean;
  service: string;
  version: string;
  status: string;
  models_loaded: {
    project_cost: boolean;
    project_duration: boolean;
    customer_segmentation: boolean;
    employee_turnover: boolean;
    inventory_forecast: boolean;
  };
  timestamp: string;
}

// Catalogs for forms
export const PROJECT_TYPES = [
  { id: 1, name: 'Residencial' },
  { id: 2, name: 'Comercial' },
  { id: 3, name: 'Industrial' },
  { id: 4, name: 'Infraestructura' },
  { id: 5, name: 'Renovacion' },
];

export const LOCATION_ZONES = [
  { id: 1, name: 'Urbano Premium' },
  { id: 2, name: 'Urbano' },
  { id: 3, name: 'Suburbano' },
  { id: 4, name: 'Rural' },
];

export const MATERIAL_QUALITY = [
  { id: 1, name: 'Economico' },
  { id: 2, name: 'Estandar' },
  { id: 3, name: 'Premium' },
];

export const SEASONS = [
  { id: 1, name: 'Q1 (Ene-Mar)' },
  { id: 2, name: 'Q2 (Abr-Jun)' },
  { id: 3, name: 'Q3 (Jul-Sep)' },
  { id: 4, name: 'Q4 (Oct-Dic)' },
];

export const DEPARTMENTS = [
  { id: 1, name: 'Operaciones' },
  { id: 2, name: 'Ventas' },
  { id: 3, name: 'Administracion' },
  { id: 4, name: 'Ingenieria' },
  { id: 5, name: 'Recursos Humanos' },
  { id: 6, name: 'Finanzas' },
];

export const SALARY_LEVELS = [
  { id: 1, name: 'Entrada' },
  { id: 2, name: 'Junior' },
  { id: 3, name: 'Mid' },
  { id: 4, name: 'Senior' },
  { id: 5, name: 'Ejecutivo' },
];

export const MATERIALS = [
  { id: 1, name: 'Cemento Portland', unit: 'Sacos', reorder_point: 200, lead_time_days: 3 },
  { id: 2, name: 'Varilla de Acero', unit: 'Toneladas', reorder_point: 15, lead_time_days: 5 },
  { id: 3, name: 'Block de Concreto', unit: 'Piezas', reorder_point: 800, lead_time_days: 2 },
  { id: 4, name: 'Arena', unit: 'm³', reorder_point: 60, lead_time_days: 2 },
  { id: 5, name: 'Grava', unit: 'm³', reorder_point: 50, lead_time_days: 2 },
];
