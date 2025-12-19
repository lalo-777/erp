"""
Customer Data Generator - Creates realistic customer data for K-Means clustering.
Generates data that naturally forms 4 clusters: VIP, Frequent, Sporadic, New.
"""
import numpy as np
import pandas as pd
from typing import Optional


class CustomerDataGenerator:
    """Generates synthetic customer data for K-Means segmentation."""

    INDUSTRY_TYPES = {
        1: 'Construccion',
        2: 'Inmobiliaria',
        3: 'Comercio',
        4: 'Manufactura',
        5: 'Servicios',
        6: 'Gobierno',
    }

    COMPANY_SIZES = {
        1: 'Pequena',
        2: 'Mediana',
        3: 'Grande',
    }

    def __init__(self, seed: Optional[int] = 42):
        """Initialize generator with optional random seed."""
        self.seed = seed
        if seed is not None:
            np.random.seed(seed)

    def generate(self, n_samples: int = 300) -> pd.DataFrame:
        """
        Generate synthetic customer data designed to form natural clusters.

        The data is generated to create 4 natural customer segments:
        - VIP (~12%): High revenue, long tenure, frequent projects
        - Frequent (~28%): Regular customers with moderate revenue
        - Sporadic (~42%): Occasional customers with lower engagement
        - New (~18%): Recent customers with limited history

        Args:
            n_samples: Number of customer records to generate.

        Returns:
            DataFrame with customer features.
        """
        # Calculate segment sizes
        n_vip = int(n_samples * 0.12)
        n_frequent = int(n_samples * 0.28)
        n_sporadic = int(n_samples * 0.42)
        n_new = n_samples - n_vip - n_frequent - n_sporadic

        # Generate each segment
        vip_data = self._generate_vip_segment(n_vip)
        frequent_data = self._generate_frequent_segment(n_frequent)
        sporadic_data = self._generate_sporadic_segment(n_sporadic)
        new_data = self._generate_new_segment(n_new)

        # Combine and shuffle
        df = pd.concat([vip_data, frequent_data, sporadic_data, new_data], ignore_index=True)
        df = df.sample(frac=1, random_state=self.seed).reset_index(drop=True)

        # Assign sequential IDs
        df['customer_id'] = range(1, len(df) + 1)

        # Reorder columns
        cols = ['customer_id'] + [c for c in df.columns if c != 'customer_id']
        df = df[cols]

        # Calculate derived features
        df['avg_project_value'] = (df['total_revenue'] / df['num_projects']).round(2)
        df['project_frequency'] = (df['num_projects'] / (df['months_as_customer'] / 12)).round(2)
        df['project_frequency'] = df['project_frequency'].clip(0.1, 20)

        return df

    def _generate_vip_segment(self, n: int) -> pd.DataFrame:
        """Generate VIP customers: high value, long tenure, very engaged."""
        return pd.DataFrame({
            'total_revenue': np.random.lognormal(mean=16.5, sigma=0.4, size=n).clip(5000000, 50000000),
            'num_projects': np.random.poisson(lam=12, size=n) + 5,
            'months_as_customer': np.random.normal(loc=60, scale=15, size=n).clip(36, 120).astype(int),
            'payment_delay_avg_days': np.random.gamma(shape=1.5, scale=2, size=n).clip(0, 10).round(1),
            'num_referrals': np.random.poisson(lam=4, size=n),
            'communication_score': np.random.normal(loc=9, scale=0.5, size=n).clip(7, 10).round(1),
            'industry_type': np.random.choice([1, 2, 4], size=n, p=[0.4, 0.4, 0.2]),
            'company_size': np.full(n, 3),  # Mostly large companies
        })

    def _generate_frequent_segment(self, n: int) -> pd.DataFrame:
        """Generate frequent customers: regular engagement, moderate value."""
        return pd.DataFrame({
            'total_revenue': np.random.lognormal(mean=15, sigma=0.5, size=n).clip(1000000, 10000000),
            'num_projects': np.random.poisson(lam=6, size=n) + 2,
            'months_as_customer': np.random.normal(loc=36, scale=12, size=n).clip(18, 72).astype(int),
            'payment_delay_avg_days': np.random.gamma(shape=2, scale=3, size=n).clip(0, 20).round(1),
            'num_referrals': np.random.poisson(lam=2, size=n),
            'communication_score': np.random.normal(loc=7.5, scale=1, size=n).clip(5, 10).round(1),
            'industry_type': np.random.choice([1, 2, 3, 4, 5], size=n, p=[0.3, 0.25, 0.2, 0.15, 0.1]),
            'company_size': np.random.choice([2, 3], size=n, p=[0.6, 0.4]),
        })

    def _generate_sporadic_segment(self, n: int) -> pd.DataFrame:
        """Generate sporadic customers: occasional projects, lower engagement."""
        return pd.DataFrame({
            'total_revenue': np.random.lognormal(mean=13.5, sigma=0.7, size=n).clip(200000, 3000000),
            'num_projects': np.random.poisson(lam=2, size=n) + 1,
            'months_as_customer': np.random.exponential(scale=24, size=n).clip(6, 60).astype(int),
            'payment_delay_avg_days': np.random.gamma(shape=2.5, scale=5, size=n).clip(0, 45).round(1),
            'num_referrals': np.random.poisson(lam=0.5, size=n),
            'communication_score': np.random.normal(loc=6.5, scale=1.5, size=n).clip(3, 10).round(1),
            'industry_type': np.random.choice([1, 2, 3, 4, 5, 6], size=n),
            'company_size': np.random.choice([1, 2], size=n, p=[0.7, 0.3]),
        })

    def _generate_new_segment(self, n: int) -> pd.DataFrame:
        """Generate new customers: recent, limited history, potential to grow."""
        return pd.DataFrame({
            'total_revenue': np.random.lognormal(mean=12.5, sigma=0.8, size=n).clip(100000, 2000000),
            'num_projects': np.random.choice([1, 2], size=n, p=[0.7, 0.3]),
            'months_as_customer': np.random.uniform(1, 12, size=n).astype(int),
            'payment_delay_avg_days': np.random.gamma(shape=2, scale=4, size=n).clip(0, 30).round(1),
            'num_referrals': np.zeros(n, dtype=int),
            'communication_score': np.random.normal(loc=7, scale=1.2, size=n).clip(4, 10).round(1),
            'industry_type': np.random.choice([1, 2, 3, 4, 5, 6], size=n),
            'company_size': np.random.choice([1, 2, 3], size=n, p=[0.5, 0.35, 0.15]),
        })

    def get_feature_names(self) -> list:
        """Return feature names for clustering."""
        return [
            'total_revenue', 'num_projects', 'avg_project_value',
            'months_as_customer', 'payment_delay_avg_days', 'num_referrals',
            'communication_score', 'project_frequency'
        ]

    def get_feature_labels(self) -> dict:
        """Return human-readable labels for features."""
        return {
            'total_revenue': 'Ingresos Totales',
            'num_projects': 'Num. Proyectos',
            'avg_project_value': 'Valor Prom. Proyecto',
            'months_as_customer': 'Meses como Cliente',
            'payment_delay_avg_days': 'Demora Pago (dias)',
            'num_referrals': 'Referidos',
            'communication_score': 'Score Comunicacion',
            'project_frequency': 'Frecuencia Proyectos/Ano',
            'industry_type': 'Industria',
            'company_size': 'Tamano Empresa',
        }

    def get_segment_info(self) -> dict:
        """Return segment metadata for visualization."""
        return {
            0: {
                'name': 'VIP',
                'color': '#FFD700',
                'description': 'Clientes de alto valor con relaciones a largo plazo',
                'icon': 'star'
            },
            1: {
                'name': 'Frecuente',
                'color': '#4CAF50',
                'description': 'Clientes regulares con buen potencial de crecimiento',
                'icon': 'trending_up'
            },
            2: {
                'name': 'Esporadico',
                'color': '#FF9800',
                'description': 'Clientes ocasionales, sensibles al precio',
                'icon': 'schedule'
            },
            3: {
                'name': 'Nuevo',
                'color': '#2196F3',
                'description': 'Clientes recientes con potencial por desarrollar',
                'icon': 'fiber_new'
            },
        }
