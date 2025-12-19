"""
Employee Data Generator - Creates realistic employee data for turnover prediction.
Generates data with realistic turnover patterns (18-22% rate) using logistic probability.
"""
import numpy as np
import pandas as pd
from typing import Optional


class EmployeeDataGenerator:
    """Generates synthetic employee data for Logistic Regression turnover prediction."""

    DEPARTMENTS = {
        1: 'Operaciones',
        2: 'Ventas',
        3: 'Administracion',
        4: 'Ingenieria',
        5: 'Recursos Humanos',
        6: 'Finanzas',
    }

    SALARY_LEVELS = {
        1: 'Entrada',
        2: 'Junior',
        3: 'Mid',
        4: 'Senior',
        5: 'Ejecutivo',
    }

    def __init__(self, seed: Optional[int] = 42):
        """Initialize generator with optional random seed."""
        self.seed = seed
        if seed is not None:
            np.random.seed(seed)

    def generate(self, n_samples: int = 400) -> pd.DataFrame:
        """
        Generate synthetic employee data with realistic turnover patterns.

        The turnover probability is calculated using a logistic function that
        considers multiple factors with realistic weights.

        Args:
            n_samples: Number of employee records to generate.

        Returns:
            DataFrame with employee features and turnover target.
        """
        data = {
            'employee_id': range(1, n_samples + 1),
            'tenure_months': self._generate_tenure(n_samples),
            'age': self._generate_age(n_samples),
            'salary_level': self._generate_salary_level(n_samples),
            'department': self._generate_department(n_samples),
            'performance_score': self._generate_performance(n_samples),
            'overtime_hours_monthly': self._generate_overtime(n_samples),
            'distance_from_home_km': self._generate_distance(n_samples),
            'num_promotions': self._generate_promotions(n_samples),
            'training_hours_yearly': self._generate_training(n_samples),
            'satisfaction_score': self._generate_satisfaction(n_samples),
            'num_projects_assigned': self._generate_projects(n_samples),
        }

        df = pd.DataFrame(data)

        # Adjust some features based on others for realism
        df = self._apply_correlations(df)

        # Calculate turnover probability and outcome
        df['turnover_probability'] = self._calculate_turnover_probability(df)
        df['has_left'] = df['turnover_probability'].apply(
            lambda p: np.random.binomial(1, p)
        ).astype(bool)

        # Remove the probability column (it's for generation only)
        df = df.drop('turnover_probability', axis=1)

        return df

    def _generate_tenure(self, n: int) -> np.ndarray:
        """Generate tenure using Exponential distribution (many short, few long)."""
        tenure = np.random.exponential(scale=30, size=n)
        return np.clip(tenure, 1, 180).astype(int)

    def _generate_age(self, n: int) -> np.ndarray:
        """Generate age using Normal distribution."""
        age = np.random.normal(loc=35, scale=10, size=n)
        return np.clip(age, 20, 65).astype(int)

    def _generate_salary_level(self, n: int) -> np.ndarray:
        """Generate salary level with pyramid distribution."""
        weights = [0.25, 0.30, 0.25, 0.15, 0.05]
        return np.random.choice([1, 2, 3, 4, 5], size=n, p=weights)

    def _generate_department(self, n: int) -> np.ndarray:
        """Generate department distribution."""
        weights = [0.30, 0.20, 0.15, 0.20, 0.08, 0.07]
        return np.random.choice([1, 2, 3, 4, 5, 6], size=n, p=weights)

    def _generate_performance(self, n: int) -> np.ndarray:
        """Generate performance using Beta distribution (skewed towards good)."""
        performance = np.random.beta(a=5, b=2, size=n) * 10
        return np.clip(performance, 1, 10).round(1)

    def _generate_overtime(self, n: int) -> np.ndarray:
        """Generate overtime hours using Exponential distribution."""
        overtime = np.random.exponential(scale=15, size=n)
        return np.clip(overtime, 0, 80).round(1)

    def _generate_distance(self, n: int) -> np.ndarray:
        """Generate commute distance using Exponential distribution."""
        distance = np.random.exponential(scale=20, size=n)
        return np.clip(distance, 1, 100).round(1)

    def _generate_promotions(self, n: int) -> np.ndarray:
        """Generate promotions using Poisson distribution."""
        promotions = np.random.poisson(lam=0.8, size=n)
        return np.clip(promotions, 0, 5)

    def _generate_training(self, n: int) -> np.ndarray:
        """Generate training hours using Normal distribution."""
        training = np.random.normal(loc=40, scale=15, size=n)
        return np.clip(training, 0, 100).astype(int)

    def _generate_satisfaction(self, n: int) -> np.ndarray:
        """Generate satisfaction using Beta distribution."""
        satisfaction = np.random.beta(a=3, b=2, size=n) * 10
        return np.clip(satisfaction, 1, 10).round(1)

    def _generate_projects(self, n: int) -> np.ndarray:
        """Generate number of assigned projects using Poisson."""
        projects = np.random.poisson(lam=3, size=n) + 1
        return np.clip(projects, 1, 10)

    def _apply_correlations(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply realistic correlations between features."""
        # More tenure -> higher salary level (sometimes)
        for i in range(len(df)):
            if df.loc[i, 'tenure_months'] > 60 and df.loc[i, 'salary_level'] < 3:
                if np.random.random() > 0.5:
                    df.loc[i, 'salary_level'] = min(df.loc[i, 'salary_level'] + 1, 5)

            # More tenure -> more promotions
            if df.loc[i, 'tenure_months'] > 48 and df.loc[i, 'num_promotions'] == 0:
                if np.random.random() > 0.6:
                    df.loc[i, 'num_promotions'] = 1

            # Higher salary -> less overtime (usually)
            if df.loc[i, 'salary_level'] >= 4:
                df.loc[i, 'overtime_hours_monthly'] *= 0.7

            # Low performance -> less training (sometimes)
            if df.loc[i, 'performance_score'] < 5:
                df.loc[i, 'training_hours_yearly'] = int(df.loc[i, 'training_hours_yearly'] * 0.8)

        return df

    def _calculate_turnover_probability(self, df: pd.DataFrame) -> np.ndarray:
        """
        Calculate turnover probability using logistic regression formula.
        Target: 18-22% overall turnover rate.
        """
        probabilities = np.zeros(len(df))

        for i, row in df.iterrows():
            # Log-odds calculation with realistic coefficients
            log_odds = (
                -1.8  # Base intercept (adjust to get ~20% turnover)

                # Negative factors (reduce turnover)
                - 0.015 * row['tenure_months']           # Longer tenure = less likely to leave
                - 0.12 * row['salary_level']             # Higher salary = less likely
                - 0.15 * row['satisfaction_score']       # Higher satisfaction = less likely
                - 0.08 * row['num_promotions']           # More promotions = less likely
                - 0.01 * row['training_hours_yearly']    # More training = less likely
                - 0.05 * row['performance_score']        # Higher performer = valued, less likely

                # Positive factors (increase turnover)
                + 0.025 * row['overtime_hours_monthly']  # More overtime = burnout
                + 0.012 * row['distance_from_home_km']   # Longer commute = more likely
                + 0.05 * row['num_projects_assigned']    # More projects = stress

                # Department factors (some have higher turnover)
                + (0.3 if row['department'] == 2 else 0)   # Sales higher turnover
                + (0.2 if row['department'] == 1 else 0)   # Operations moderate
                - (0.2 if row['department'] == 6 else 0)   # Finance lower

                # Age factor (U-shaped: young and near retirement more likely)
                + (0.2 if row['age'] < 28 else 0)
                + (0.15 if row['age'] > 55 else 0)
            )

            # Convert to probability using sigmoid
            probability = 1 / (1 + np.exp(-log_odds))

            # Add some random noise to avoid too deterministic
            probability = probability + np.random.normal(0, 0.05)
            probabilities[i] = np.clip(probability, 0.02, 0.95)

        return probabilities

    def get_feature_names(self) -> list:
        """Return feature names for ML model."""
        return [
            'tenure_months', 'age', 'salary_level', 'department',
            'performance_score', 'overtime_hours_monthly', 'distance_from_home_km',
            'num_promotions', 'training_hours_yearly', 'satisfaction_score',
            'num_projects_assigned'
        ]

    def get_feature_labels(self) -> dict:
        """Return human-readable labels for features."""
        return {
            'tenure_months': 'Antiguedad (meses)',
            'age': 'Edad',
            'salary_level': 'Nivel Salarial',
            'department': 'Departamento',
            'performance_score': 'Desempeno',
            'overtime_hours_monthly': 'Horas Extra/Mes',
            'distance_from_home_km': 'Distancia Casa (km)',
            'num_promotions': 'Promociones',
            'training_hours_yearly': 'Capacitacion (hrs/ano)',
            'satisfaction_score': 'Satisfaccion',
            'num_projects_assigned': 'Proyectos Asignados',
        }

    def get_risk_levels(self) -> dict:
        """Return risk level definitions."""
        return {
            'low': {'max_prob': 0.3, 'color': '#4CAF50', 'label': 'Bajo'},
            'medium': {'max_prob': 0.6, 'color': '#FF9800', 'label': 'Medio'},
            'high': {'max_prob': 1.0, 'color': '#F44336', 'label': 'Alto'},
        }
