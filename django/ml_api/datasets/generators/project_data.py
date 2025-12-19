"""
Project Data Generator - Creates realistic project data for cost and duration predictions.
Uses various statistical distributions to create non-obvious, realistic patterns.
"""
import numpy as np
import pandas as pd
from typing import Optional


class ProjectDataGenerator:
    """Generates synthetic project data for Random Forest and Gradient Boosting models."""

    PROJECT_TYPES = {
        1: {'name': 'Residencial', 'cost_factor': 1.0, 'duration_factor': 1.0},
        2: {'name': 'Comercial', 'cost_factor': 1.3, 'duration_factor': 1.2},
        3: {'name': 'Industrial', 'cost_factor': 1.5, 'duration_factor': 1.4},
        4: {'name': 'Infraestructura', 'cost_factor': 1.8, 'duration_factor': 1.6},
        5: {'name': 'Renovacion', 'cost_factor': 0.8, 'duration_factor': 0.9},
    }

    LOCATION_ZONES = {
        1: {'name': 'Urbano Premium', 'cost_mult': 1.4, 'delay_prob': 0.15},
        2: {'name': 'Urbano', 'cost_mult': 1.2, 'delay_prob': 0.10},
        3: {'name': 'Suburbano', 'cost_mult': 1.0, 'delay_prob': 0.08},
        4: {'name': 'Rural', 'cost_mult': 0.85, 'delay_prob': 0.20},
    }

    MATERIAL_QUALITY = {
        1: {'name': 'Economico', 'cost_mult': 0.7, 'quality_score': 5},
        2: {'name': 'Estandar', 'cost_mult': 1.0, 'quality_score': 7},
        3: {'name': 'Premium', 'cost_mult': 1.5, 'quality_score': 9},
    }

    def __init__(self, seed: Optional[int] = 42):
        """Initialize generator with optional random seed for reproducibility."""
        self.seed = seed
        if seed is not None:
            np.random.seed(seed)

    def generate(self, n_samples: int = 500) -> pd.DataFrame:
        """
        Generate synthetic project data.

        Args:
            n_samples: Number of project records to generate.

        Returns:
            DataFrame with project features and targets (cost, duration).
        """
        data = {
            'project_id': range(1, n_samples + 1),
            'project_type_id': self._generate_project_types(n_samples),
            'area_m2': self._generate_area(n_samples),
            'num_floors': self._generate_floors(n_samples),
            'location_zone': self._generate_location_zones(n_samples),
            'complexity_score': self._generate_complexity(n_samples),
            'material_quality': self._generate_material_quality(n_samples),
            'has_basement': self._generate_bernoulli(n_samples, 0.25),
            'has_pool': self._generate_bernoulli(n_samples, 0.15),
            'season_start': self._generate_season(n_samples),
            'team_size': self._generate_team_size(n_samples),
            'manager_experience_years': self._generate_experience(n_samples),
        }

        df = pd.DataFrame(data)

        # Calculate target variables with realistic noise
        df['actual_cost'] = self._calculate_cost(df)
        df['actual_duration_days'] = self._calculate_duration(df)

        return df

    def _generate_project_types(self, n: int) -> np.ndarray:
        """Generate project types with weighted distribution."""
        weights = [0.35, 0.25, 0.15, 0.10, 0.15]  # Residential most common
        return np.random.choice([1, 2, 3, 4, 5], size=n, p=weights)

    def _generate_area(self, n: int) -> np.ndarray:
        """Generate area using LogNormal distribution (realistic building sizes)."""
        # LogNormal(6.5, 0.8) gives range roughly 100 - 15000 m²
        areas = np.random.lognormal(mean=6.5, sigma=0.8, size=n)
        return np.clip(areas, 80, 20000).round(2)

    def _generate_floors(self, n: int) -> np.ndarray:
        """Generate number of floors using Poisson distribution."""
        floors = np.random.poisson(lam=3, size=n) + 1
        return np.clip(floors, 1, 50)

    def _generate_location_zones(self, n: int) -> np.ndarray:
        """Generate location zones with urban bias."""
        weights = [0.15, 0.40, 0.30, 0.15]
        return np.random.choice([1, 2, 3, 4], size=n, p=weights)

    def _generate_complexity(self, n: int) -> np.ndarray:
        """Generate complexity using Beta distribution (most projects mid-complexity)."""
        # Beta(2, 5) skews towards lower values
        complexity = np.random.beta(a=2, b=5, size=n) * 10
        return np.clip(complexity, 1, 10).round(2)

    def _generate_material_quality(self, n: int) -> np.ndarray:
        """Generate material quality with standard being most common."""
        weights = [0.30, 0.50, 0.20]
        return np.random.choice([1, 2, 3], size=n, p=weights)

    def _generate_bernoulli(self, n: int, p: float) -> np.ndarray:
        """Generate boolean values with given probability."""
        return np.random.binomial(1, p, size=n).astype(bool)

    def _generate_season(self, n: int) -> np.ndarray:
        """Generate start season (quarter) with slight preference for Q1-Q2."""
        weights = [0.30, 0.30, 0.25, 0.15]
        return np.random.choice([1, 2, 3, 4], size=n, p=weights)

    def _generate_team_size(self, n: int) -> np.ndarray:
        """Generate team size using Normal distribution."""
        team_sizes = np.random.normal(loc=12, scale=4, size=n)
        return np.clip(team_sizes, 3, 50).astype(int)

    def _generate_experience(self, n: int) -> np.ndarray:
        """Generate manager experience using Exponential distribution."""
        experience = np.random.exponential(scale=5, size=n)
        return np.clip(experience, 0.5, 30).round(1)

    def _calculate_cost(self, df: pd.DataFrame) -> np.ndarray:
        """
        Calculate project cost based on features with realistic noise.
        Cost formula considers multiple factors and interactions.
        """
        costs = np.zeros(len(df))

        for i, row in df.iterrows():
            # Base cost per m² depends on project type
            type_info = self.PROJECT_TYPES[row['project_type_id']]
            base_cost_per_m2 = 3500 * type_info['cost_factor']

            # Area cost (non-linear - economies of scale)
            area_cost = row['area_m2'] * base_cost_per_m2 * (1 - 0.0001 * row['area_m2'])

            # Floor multiplier (more floors = more cost per floor due to structure)
            floor_mult = 1 + (row['num_floors'] - 1) * 0.08

            # Location multiplier
            location_mult = self.LOCATION_ZONES[row['location_zone']]['cost_mult']

            # Material quality multiplier
            quality_mult = self.MATERIAL_QUALITY[row['material_quality']]['cost_mult']

            # Complexity multiplier (exponential impact)
            complexity_mult = 1 + (row['complexity_score'] / 10) ** 1.5 * 0.5

            # Features additions
            basement_add = row['area_m2'] * 1500 if row['has_basement'] else 0
            pool_add = 350000 if row['has_pool'] else 0

            # Team efficiency (larger teams have overhead)
            team_factor = 1 + max(0, row['team_size'] - 15) * 0.01

            # Experience discount
            exp_discount = 1 - min(row['manager_experience_years'] * 0.008, 0.15)

            # Season factor (rainy season Q3-Q4 adds costs)
            season_factor = 1.05 if row['season_start'] >= 3 else 1.0

            # Calculate total
            total = (area_cost * floor_mult * location_mult * quality_mult *
                     complexity_mult * team_factor * exp_discount * season_factor +
                     basement_add + pool_add)

            # Add realistic noise (12% standard deviation)
            noise = np.random.normal(0, total * 0.12)
            costs[i] = max(total + noise, row['area_m2'] * 1000)  # Minimum cost floor

        return costs.round(2)

    def _calculate_duration(self, df: pd.DataFrame) -> np.ndarray:
        """
        Calculate project duration based on features with realistic variability.
        """
        durations = np.zeros(len(df))

        for i, row in df.iterrows():
            # Base duration depends on area and project type
            type_info = self.PROJECT_TYPES[row['project_type_id']]

            # Base days from area (non-linear relationship)
            base_days = 30 + np.sqrt(row['area_m2']) * 2

            # Floor time (each floor adds time with diminishing returns)
            floor_days = row['num_floors'] * 12 * (1 - 0.02 * row['num_floors'])

            # Type factor
            type_factor = type_info['duration_factor']

            # Complexity impact (exponential)
            complexity_factor = 1 + (row['complexity_score'] / 10) ** 2 * 0.8

            # Team efficiency (optimal around 10-15, too small or large is inefficient)
            optimal_team = 12
            team_efficiency = 1 + abs(row['team_size'] - optimal_team) * 0.015

            # Experience reduces time
            exp_factor = 1 - min(row['manager_experience_years'] * 0.015, 0.25)

            # Material quality (premium takes longer for craftsmanship)
            quality_factor = 0.9 + row['material_quality'] * 0.1

            # Location delays
            location_info = self.LOCATION_ZONES[row['location_zone']]
            delay_prob = location_info['delay_prob']
            delay_factor = 1 + np.random.binomial(1, delay_prob) * np.random.uniform(0.1, 0.3)

            # Season impact (rainy season delays)
            season_delay = 1.15 if row['season_start'] == 3 else (1.10 if row['season_start'] == 4 else 1.0)

            # Feature additions
            basement_days = 25 if row['has_basement'] else 0
            pool_days = 20 if row['has_pool'] else 0

            # Calculate total
            total = ((base_days + floor_days + basement_days + pool_days) *
                     type_factor * complexity_factor * team_efficiency *
                     exp_factor * quality_factor * delay_factor * season_delay)

            # Add realistic noise (15% standard deviation)
            noise = np.random.normal(0, total * 0.15)
            durations[i] = max(total + noise, 30)  # Minimum 30 days

        return durations.round(0).astype(int)

    def get_feature_names(self) -> list:
        """Return list of feature names for ML models."""
        return [
            'project_type_id', 'area_m2', 'num_floors', 'location_zone',
            'complexity_score', 'material_quality', 'has_basement', 'has_pool',
            'season_start', 'team_size', 'manager_experience_years'
        ]

    def get_feature_labels(self) -> dict:
        """Return human-readable labels for features."""
        return {
            'project_type_id': 'Tipo de Proyecto',
            'area_m2': 'Area (m²)',
            'num_floors': 'Num. Pisos',
            'location_zone': 'Zona',
            'complexity_score': 'Complejidad',
            'material_quality': 'Calidad Material',
            'has_basement': 'Sotano',
            'has_pool': 'Piscina',
            'season_start': 'Trimestre Inicio',
            'team_size': 'Tam. Equipo',
            'manager_experience_years': 'Exp. Gerente (años)'
        }
