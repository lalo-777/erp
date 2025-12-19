"""
Inventory Data Generator - Creates realistic time series data for ARIMA forecasting.
Generates 2 years of daily demand data with trend, seasonality, and noise.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List


class InventoryDataGenerator:
    """Generates synthetic inventory time series data for ARIMA forecasting."""

    MATERIALS = {
        1: {
            'name': 'Cemento Portland',
            'unit': 'Sacos',
            'base_demand': 120,
            'seasonal_amplitude': 25,
            'weekly_amplitude': 15,
            'trend': 0.008,
            'noise_std': 12,
            'unit_cost': 185.50,
            'reorder_point': 200,
            'lead_time_days': 3,
        },
        2: {
            'name': 'Varilla de Acero',
            'unit': 'Toneladas',
            'base_demand': 8,
            'seasonal_amplitude': 1.5,
            'weekly_amplitude': 1,
            'trend': 0.012,
            'noise_std': 1.2,
            'unit_cost': 18500.00,
            'reorder_point': 15,
            'lead_time_days': 5,
        },
        3: {
            'name': 'Block de Concreto',
            'unit': 'Piezas',
            'base_demand': 450,
            'seasonal_amplitude': 80,
            'weekly_amplitude': 50,
            'trend': 0.005,
            'noise_std': 45,
            'unit_cost': 12.50,
            'reorder_point': 800,
            'lead_time_days': 2,
        },
        4: {
            'name': 'Arena',
            'unit': 'm³',
            'base_demand': 35,
            'seasonal_amplitude': 8,
            'weekly_amplitude': 5,
            'trend': 0.006,
            'noise_std': 5,
            'unit_cost': 350.00,
            'reorder_point': 60,
            'lead_time_days': 2,
        },
        5: {
            'name': 'Grava',
            'unit': 'm³',
            'base_demand': 28,
            'seasonal_amplitude': 6,
            'weekly_amplitude': 4,
            'trend': 0.005,
            'noise_std': 4,
            'unit_cost': 420.00,
            'reorder_point': 50,
            'lead_time_days': 2,
        },
    }

    def __init__(self, seed: Optional[int] = 42):
        """Initialize generator with optional random seed."""
        self.seed = seed
        if seed is not None:
            np.random.seed(seed)

    def generate(self, days: int = 730, material_ids: Optional[List[int]] = None) -> pd.DataFrame:
        """
        Generate time series inventory data for specified materials.

        Args:
            days: Number of days of history to generate (default 730 = 2 years).
            material_ids: List of material IDs to generate. None for all.

        Returns:
            DataFrame with daily demand data for each material.
        """
        if material_ids is None:
            material_ids = list(self.MATERIALS.keys())

        all_data = []
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days - 1)

        for material_id in material_ids:
            material_data = self._generate_material_series(
                material_id, start_date, days
            )
            all_data.append(material_data)

        df = pd.concat(all_data, ignore_index=True)
        return df

    def _generate_material_series(
        self, material_id: int, start_date, days: int
    ) -> pd.DataFrame:
        """Generate time series for a single material."""
        material = self.MATERIALS[material_id]

        dates = [start_date + timedelta(days=i) for i in range(days)]
        demands = np.zeros(days)

        for i in range(days):
            day_of_year = dates[i].timetuple().tm_yday
            day_of_week = dates[i].weekday()

            # Trend component (gradual increase/decrease)
            trend = material['trend'] * i

            # Annual seasonality (construction peaks in spring/summer)
            # Peak around day 150 (late May/early June)
            seasonal = material['seasonal_amplitude'] * np.sin(
                2 * np.pi * (day_of_year - 90) / 365
            )

            # Weekly pattern (lower on weekends)
            if day_of_week >= 5:  # Weekend
                weekly = -material['weekly_amplitude'] * 0.7
            else:
                weekly = material['weekly_amplitude'] * np.sin(
                    2 * np.pi * day_of_week / 5
                ) * 0.3

            # Holiday effects (lower demand)
            holiday_factor = 1.0
            if dates[i].month == 12 and dates[i].day >= 20:
                holiday_factor = 0.4  # Christmas period
            elif dates[i].month == 1 and dates[i].day <= 6:
                holiday_factor = 0.5  # New Year
            elif dates[i].month == 4 and dates[i].day >= 10 and dates[i].day <= 20:
                holiday_factor = 0.6  # Easter (approximate)

            # Random events (occasional spikes or dips)
            event_factor = 1.0
            if np.random.random() < 0.02:  # 2% chance of unusual day
                event_factor = np.random.uniform(0.5, 1.8)

            # Random noise
            noise = np.random.normal(0, material['noise_std'])

            # Combine all components
            demand = (
                (material['base_demand'] + trend + seasonal + weekly)
                * holiday_factor
                * event_factor
                + noise
            )

            demands[i] = max(0, demand)  # No negative demand

        # Calculate running stock level (simulated)
        stock_levels = self._simulate_stock_levels(demands, material)

        return pd.DataFrame({
            'date': dates,
            'material_id': material_id,
            'material_name': material['name'],
            'unit': material['unit'],
            'daily_demand': demands.round(2),
            'stock_level': stock_levels.round(2),
            'reorder_point': material['reorder_point'],
            'lead_time_days': material['lead_time_days'],
            'unit_cost': material['unit_cost'],
        })

    def _simulate_stock_levels(
        self, demands: np.ndarray, material: dict
    ) -> np.ndarray:
        """Simulate stock levels with reordering."""
        stock = np.zeros(len(demands))
        initial_stock = material['reorder_point'] * 3
        stock[0] = initial_stock

        pending_order = 0
        order_arriving_day = -1
        order_quantity = material['reorder_point'] * 2.5

        for i in range(1, len(demands)):
            # Check if order arrives
            if i == order_arriving_day:
                stock[i - 1] += pending_order
                pending_order = 0
                order_arriving_day = -1

            # Calculate today's stock
            stock[i] = stock[i - 1] - demands[i]

            # Check if we need to reorder
            if stock[i] <= material['reorder_point'] and pending_order == 0:
                pending_order = order_quantity
                order_arriving_day = i + material['lead_time_days']

            # Don't let stock go negative (backorder simulation)
            if stock[i] < 0:
                stock[i] = 0

        return stock

    def generate_forecast_input(self, material_id: int, current_stock: float) -> dict:
        """Generate input data for forecasting endpoint."""
        material = self.MATERIALS.get(material_id)
        if not material:
            raise ValueError(f"Material ID {material_id} not found")

        return {
            'material_id': material_id,
            'forecast_days': 30,
            'current_stock': current_stock,
            'reorder_point': material['reorder_point'],
            'lead_time_days': material['lead_time_days'],
        }

    def get_material_info(self, material_id: int) -> dict:
        """Get information about a specific material."""
        return self.MATERIALS.get(material_id)

    def get_all_materials(self) -> dict:
        """Get all material definitions."""
        return self.MATERIALS

    def get_seasonality_pattern(self, material_id: int) -> dict:
        """Get monthly seasonality pattern for visualization."""
        material = self.MATERIALS.get(material_id, self.MATERIALS[1])

        months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

        # Calculate seasonal factors for each month
        factors = []
        for month in range(1, 13):
            day_of_year = (month - 1) * 30 + 15  # Mid-month approximation
            seasonal = material['seasonal_amplitude'] * np.sin(
                2 * np.pi * (day_of_year - 90) / 365
            )
            factor = material['base_demand'] + seasonal
            factors.append(round(factor, 1))

        return {
            'labels': months,
            'values': factors,
            'material_name': material['name'],
        }
