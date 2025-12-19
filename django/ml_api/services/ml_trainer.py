"""
ML Trainer Service - Handles training and persistence of ML models.
"""
import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    silhouette_score
)
from statsmodels.tsa.arima.model import ARIMA
import warnings

from django.conf import settings

warnings.filterwarnings('ignore')


class MLTrainer:
    """Service for training and managing ML models."""

    _instance = None
    _models: Dict[str, Any] = {}
    _scalers: Dict[str, StandardScaler] = {}
    _metrics: Dict[str, Dict] = {}
    _initialized = False

    def __new__(cls):
        """Singleton pattern to ensure models are loaded only once."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def initialize_models(self):
        """Initialize or load all ML models."""
        if self._initialized:
            return

        print("Initializing ML models...")
        self._ensure_directories()

        # Try to load existing models, or train new ones
        if not self._load_all_models():
            print("Training new models...")
            self._train_all_models()

        self._initialized = True
        print("ML models ready!")

    def _ensure_directories(self):
        """Ensure required directories exist."""
        models_dir = settings.ML_MODELS_DIR
        datasets_dir = settings.ML_DATASETS_DIR
        models_dir.mkdir(parents=True, exist_ok=True)
        datasets_dir.mkdir(parents=True, exist_ok=True)

    def _load_all_models(self) -> bool:
        """Try to load all models from disk."""
        models_dir = settings.ML_MODELS_DIR
        required_models = [
            'rf_project_cost', 'gb_project_duration',
            'kmeans_customers', 'lr_turnover'
        ]

        try:
            for model_name in required_models:
                model_path = models_dir / f'{model_name}.joblib'
                if not model_path.exists():
                    return False
                self._models[model_name] = joblib.load(model_path)

                # Load associated scaler if exists
                scaler_path = models_dir / f'{model_name}_scaler.joblib'
                if scaler_path.exists():
                    self._scalers[model_name] = joblib.load(scaler_path)

                # Load metrics if exists
                metrics_path = models_dir / f'{model_name}_metrics.joblib'
                if metrics_path.exists():
                    self._metrics[model_name] = joblib.load(metrics_path)

            print("All models loaded from disk.")
            return True
        except Exception as e:
            print(f"Error loading models: {e}")
            return False

    def _train_all_models(self):
        """Train all ML models from scratch."""
        from ml_api.datasets.generators import (
            ProjectDataGenerator, CustomerDataGenerator,
            EmployeeDataGenerator, InventoryDataGenerator
        )

        # Generate datasets
        print("Generating datasets...")
        project_gen = ProjectDataGenerator(seed=42)
        customer_gen = CustomerDataGenerator(seed=42)
        employee_gen = EmployeeDataGenerator(seed=42)
        inventory_gen = InventoryDataGenerator(seed=42)

        project_data = project_gen.generate(n_samples=500)
        customer_data = customer_gen.generate(n_samples=300)
        employee_data = employee_gen.generate(n_samples=400)
        inventory_data = inventory_gen.generate(days=730)

        # Save datasets
        datasets_dir = settings.ML_DATASETS_DIR
        project_data.to_csv(datasets_dir / 'projects.csv', index=False)
        customer_data.to_csv(datasets_dir / 'customers.csv', index=False)
        employee_data.to_csv(datasets_dir / 'employees.csv', index=False)
        inventory_data.to_csv(datasets_dir / 'inventory_history.csv', index=False)

        # Train models
        print("Training Random Forest (Project Cost)...")
        self._train_project_cost_model(project_data, project_gen.get_feature_names())

        print("Training Gradient Boosting (Project Duration)...")
        self._train_project_duration_model(project_data, project_gen.get_feature_names())

        print("Training K-Means (Customer Segmentation)...")
        self._train_customer_segmentation(customer_data, customer_gen.get_feature_names())

        print("Training Logistic Regression (Turnover)...")
        self._train_turnover_model(employee_data, employee_gen.get_feature_names())

        # ARIMA doesn't need pre-training, it's fitted per forecast request
        print("All models trained and saved.")

    def _train_project_cost_model(self, data: pd.DataFrame, feature_names: list):
        """Train Random Forest for project cost prediction."""
        X = data[feature_names].copy()
        X['has_basement'] = X['has_basement'].astype(int)
        X['has_pool'] = X['has_pool'].astype(int)
        y = data['actual_cost']

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)

        # Calculate metrics
        y_pred = model.predict(X_test)
        metrics = {
            'r2_score': round(r2_score(y_test, y_pred), 4),
            'mae': round(mean_absolute_error(y_test, y_pred), 2),
            'rmse': round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
            'feature_importance': dict(zip(
                feature_names,
                model.feature_importances_.round(4).tolist()
            ))
        }

        # Save
        self._save_model('rf_project_cost', model, metrics)
        self._models['rf_project_cost'] = model
        self._metrics['rf_project_cost'] = metrics

    def _train_project_duration_model(self, data: pd.DataFrame, feature_names: list):
        """Train Gradient Boosting for project duration prediction."""
        X = data[feature_names].copy()
        X['has_basement'] = X['has_basement'].astype(int)
        X['has_pool'] = X['has_pool'].astype(int)
        y = data['actual_duration_days']

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=8,
            learning_rate=0.1,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        model.fit(X_train, y_train)

        # Calculate metrics
        y_pred = model.predict(X_test)
        metrics = {
            'r2_score': round(r2_score(y_test, y_pred), 4),
            'mae_days': round(mean_absolute_error(y_test, y_pred), 1),
            'rmse_days': round(np.sqrt(mean_squared_error(y_test, y_pred)), 1),
            'feature_importance': dict(zip(
                feature_names,
                model.feature_importances_.round(4).tolist()
            ))
        }

        # Save
        self._save_model('gb_project_duration', model, metrics)
        self._models['gb_project_duration'] = model
        self._metrics['gb_project_duration'] = metrics

    def _train_customer_segmentation(self, data: pd.DataFrame, feature_names: list):
        """Train K-Means for customer segmentation."""
        # Use clustering features
        cluster_features = [
            'total_revenue', 'num_projects', 'months_as_customer',
            'payment_delay_avg_days', 'communication_score', 'project_frequency'
        ]
        X = data[cluster_features].copy()

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Train K-Means with 4 clusters
        model = KMeans(n_clusters=4, random_state=42, n_init=10)
        labels = model.fit_predict(X_scaled)

        # Calculate metrics
        silhouette = silhouette_score(X_scaled, labels)

        # Calculate cluster statistics
        data_with_labels = data.copy()
        data_with_labels['cluster'] = labels
        cluster_stats = {}
        for cluster_id in range(4):
            cluster_data = data_with_labels[data_with_labels['cluster'] == cluster_id]
            cluster_stats[cluster_id] = {
                'count': len(cluster_data),
                'percentage': round(len(cluster_data) / len(data) * 100, 1),
                'avg_revenue': round(cluster_data['total_revenue'].mean(), 2),
                'avg_projects': round(cluster_data['num_projects'].mean(), 1),
                'avg_tenure_months': round(cluster_data['months_as_customer'].mean(), 1),
                'avg_payment_delay': round(cluster_data['payment_delay_avg_days'].mean(), 1),
                'avg_satisfaction': round(cluster_data['communication_score'].mean(), 1),
            }

        metrics = {
            'silhouette_score': round(silhouette, 4),
            'n_clusters': 4,
            'cluster_stats': cluster_stats,
            'feature_names': cluster_features,
        }

        # Save
        self._save_model('kmeans_customers', model, metrics, scaler)
        self._models['kmeans_customers'] = model
        self._scalers['kmeans_customers'] = scaler
        self._metrics['kmeans_customers'] = metrics

    def _train_turnover_model(self, data: pd.DataFrame, feature_names: list):
        """Train Logistic Regression for turnover prediction."""
        X = data[feature_names].copy()
        y = data['has_left'].astype(int)

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )

        model = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        )
        model.fit(X_train, y_train)

        # Calculate metrics
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]

        metrics = {
            'accuracy': round(accuracy_score(y_test, y_pred), 4),
            'precision': round(precision_score(y_test, y_pred), 4),
            'recall': round(recall_score(y_test, y_pred), 4),
            'f1_score': round(f1_score(y_test, y_pred), 4),
            'auc_roc': round(roc_auc_score(y_test, y_prob), 4),
            'coefficients': dict(zip(
                feature_names,
                model.coef_[0].round(4).tolist()
            )),
            'feature_names': feature_names,
        }

        # Save
        self._save_model('lr_turnover', model, metrics, scaler)
        self._models['lr_turnover'] = model
        self._scalers['lr_turnover'] = scaler
        self._metrics['lr_turnover'] = metrics

    def _save_model(
        self, name: str, model: Any, metrics: Dict,
        scaler: Optional[StandardScaler] = None
    ):
        """Save model, metrics, and optional scaler to disk."""
        models_dir = settings.ML_MODELS_DIR
        joblib.dump(model, models_dir / f'{name}.joblib')
        joblib.dump(metrics, models_dir / f'{name}_metrics.joblib')
        if scaler is not None:
            joblib.dump(scaler, models_dir / f'{name}_scaler.joblib')

    # Prediction methods

    def predict_project_cost(self, features: Dict) -> Dict:
        """Predict project cost using Random Forest."""
        model = self._models.get('rf_project_cost')
        metrics = self._metrics.get('rf_project_cost', {})

        if model is None:
            raise ValueError("Project cost model not loaded")

        # Feature names in the exact order used during training
        feature_names = [
            'project_type_id', 'area_m2', 'num_floors', 'location_zone',
            'complexity_score', 'material_quality', 'has_basement', 'has_pool',
            'season_start', 'team_size', 'manager_experience_years'
        ]

        # Prepare features in correct order
        features['has_basement'] = int(features.get('has_basement', False))
        features['has_pool'] = int(features.get('has_pool', False))
        X = pd.DataFrame([features])[feature_names]

        # Get prediction and confidence interval
        predictions = []
        for estimator in model.estimators_:
            predictions.append(estimator.predict(X)[0])

        predicted_cost = np.mean(predictions)
        std = np.std(predictions)
        confidence_interval = (predicted_cost - 1.96 * std, predicted_cost + 1.96 * std)

        return {
            'predicted_cost': round(predicted_cost, 2),
            'confidence_interval': {
                'lower': round(max(0, confidence_interval[0]), 2),
                'upper': round(confidence_interval[1], 2),
            },
            'confidence_level': round(1 - (std / predicted_cost), 2) if predicted_cost > 0 else 0,
            'model_info': {
                'name': 'RandomForestRegressor',
                'r2_score': metrics.get('r2_score', 0),
                'mae': metrics.get('mae', 0),
                'rmse': metrics.get('rmse', 0),
                'feature_importance': metrics.get('feature_importance', {}),
            }
        }

    def predict_project_duration(self, features: Dict) -> Dict:
        """Predict project duration using Gradient Boosting."""
        model = self._models.get('gb_project_duration')
        metrics = self._metrics.get('gb_project_duration', {})

        if model is None:
            raise ValueError("Project duration model not loaded")

        # Feature names in the exact order used during training
        feature_names = [
            'project_type_id', 'area_m2', 'num_floors', 'location_zone',
            'complexity_score', 'material_quality', 'has_basement', 'has_pool',
            'season_start', 'team_size', 'manager_experience_years'
        ]

        # Prepare features in correct order
        features['has_basement'] = int(features.get('has_basement', False))
        features['has_pool'] = int(features.get('has_pool', False))
        X = pd.DataFrame([features])[feature_names]

        # Get prediction
        predicted_days = model.predict(X)[0]

        # Estimate confidence interval (using training error)
        mae = metrics.get('mae_days', 15)
        confidence_interval = (predicted_days - 1.5 * mae, predicted_days + 1.5 * mae)

        return {
            'predicted_days': int(round(predicted_days)),
            'predicted_months': round(predicted_days / 30, 1),
            'confidence_interval': {
                'lower_days': int(max(30, confidence_interval[0])),
                'upper_days': int(confidence_interval[1]),
            },
            'confidence_level': 0.80,
            'model_info': {
                'name': 'GradientBoostingRegressor',
                'r2_score': metrics.get('r2_score', 0),
                'mae_days': metrics.get('mae_days', 0),
                'rmse_days': metrics.get('rmse_days', 0),
                'feature_importance': metrics.get('feature_importance', {}),
            }
        }

    def get_customer_segments(self) -> Dict:
        """Get customer segmentation analysis."""
        model = self._models.get('kmeans_customers')
        scaler = self._scalers.get('kmeans_customers')
        metrics = self._metrics.get('kmeans_customers', {})

        if model is None:
            raise ValueError("Customer segmentation model not loaded")

        # Load customer data
        datasets_dir = settings.ML_DATASETS_DIR
        data = pd.read_csv(datasets_dir / 'customers.csv')

        cluster_features = metrics.get('feature_names', [])
        X = data[cluster_features].copy()
        X_scaled = scaler.transform(X)
        labels = model.predict(X_scaled)

        # Calculate cluster statistics
        data['cluster'] = labels
        segments = []

        segment_names = ['VIP', 'Frecuente', 'Esporadico', 'Nuevo']
        segment_colors = ['#FFD700', '#4CAF50', '#FF9800', '#2196F3']

        # Sort clusters by average revenue to assign correct names
        cluster_revenues = {}
        for cluster_id in range(4):
            cluster_data = data[data['cluster'] == cluster_id]
            cluster_revenues[cluster_id] = cluster_data['total_revenue'].mean()

        sorted_clusters = sorted(cluster_revenues.keys(), key=lambda x: cluster_revenues[x], reverse=True)

        for idx, cluster_id in enumerate(sorted_clusters):
            cluster_data = data[data['cluster'] == cluster_id]
            segments.append({
                'segment_id': idx,
                'original_cluster_id': cluster_id,
                'name': segment_names[idx],
                'count': len(cluster_data),
                'percentage': round(len(cluster_data) / len(data) * 100, 1),
                'color': segment_colors[idx],
                'characteristics': {
                    'avg_revenue': round(cluster_data['total_revenue'].mean(), 2),
                    'avg_projects': round(cluster_data['num_projects'].mean(), 1),
                    'avg_tenure_months': round(cluster_data['months_as_customer'].mean(), 1),
                    'avg_payment_delay': round(cluster_data['payment_delay_avg_days'].mean(), 1),
                    'avg_satisfaction': round(cluster_data['communication_score'].mean(), 1),
                }
            })

        return {
            'total_customers': len(data),
            'num_clusters': 4,
            'silhouette_score': metrics.get('silhouette_score', 0),
            'segments': segments,
            'raw_data': data.to_dict('records')  # For scatter plot
        }

    def predict_employee_turnover(self, features: Dict) -> Dict:
        """Predict employee turnover probability."""
        model = self._models.get('lr_turnover')
        scaler = self._scalers.get('lr_turnover')
        metrics = self._metrics.get('lr_turnover', {})

        if model is None:
            raise ValueError("Turnover model not loaded")

        feature_names = metrics.get('feature_names', [])
        X = pd.DataFrame([features])[feature_names]
        X_scaled = scaler.transform(X)

        probability = model.predict_proba(X_scaled)[0][1]

        # Determine risk level
        if probability < 0.3:
            risk_level = 'low'
            risk_color = '#4CAF50'
        elif probability < 0.6:
            risk_level = 'medium'
            risk_color = '#FF9800'
        else:
            risk_level = 'high'
            risk_color = '#F44336'

        # Calculate risk factors
        coefficients = metrics.get('coefficients', {})
        risk_factors = []
        for feature, coef in coefficients.items():
            if feature in features:
                contribution = coef * (features[feature] - 0) / 10  # Normalized contribution
                impact = 'high' if abs(contribution) > 0.15 else ('medium' if abs(contribution) > 0.08 else 'low')
                if coef > 0 and contribution > 0.05:  # Only show factors that increase risk
                    risk_factors.append({
                        'factor': feature,
                        'impact': impact,
                        'value': features[feature],
                        'contribution': round(contribution, 3)
                    })

        risk_factors.sort(key=lambda x: x['contribution'], reverse=True)

        return {
            'turnover_probability': round(probability, 3),
            'risk_level': risk_level,
            'risk_color': risk_color,
            'risk_factors': risk_factors[:5],  # Top 5 factors
            'model_info': {
                'name': 'LogisticRegression',
                'accuracy': metrics.get('accuracy', 0),
                'precision': metrics.get('precision', 0),
                'recall': metrics.get('recall', 0),
                'f1_score': metrics.get('f1_score', 0),
                'auc_roc': metrics.get('auc_roc', 0),
            }
        }

    def get_turnover_overview(self) -> Dict:
        """Get turnover overview statistics."""
        datasets_dir = settings.ML_DATASETS_DIR
        data = pd.read_csv(datasets_dir / 'employees.csv')

        model = self._models.get('lr_turnover')
        scaler = self._scalers.get('lr_turnover')
        metrics = self._metrics.get('lr_turnover', {})

        feature_names = metrics.get('feature_names', [])
        X = data[feature_names]
        X_scaled = scaler.transform(X)

        probabilities = model.predict_proba(X_scaled)[:, 1]

        high_risk = sum(probabilities >= 0.6)
        medium_risk = sum((probabilities >= 0.3) & (probabilities < 0.6))
        low_risk = sum(probabilities < 0.3)

        return {
            'total_employees': len(data),
            'predicted_at_risk': high_risk + medium_risk,
            'high_risk': int(high_risk),
            'medium_risk': int(medium_risk),
            'low_risk': int(low_risk),
            'overall_turnover_rate': round(data['has_left'].mean(), 3),
            'model_info': metrics,
        }

    def forecast_inventory(self, material_id: int, forecast_days: int,
                          current_stock: float, reorder_point: float,
                          lead_time_days: int) -> Dict:
        """Forecast inventory demand using ARIMA."""
        from ml_api.datasets.generators import InventoryDataGenerator

        datasets_dir = settings.ML_DATASETS_DIR
        data = pd.read_csv(datasets_dir / 'inventory_history.csv')

        # Filter for specific material
        material_data = data[data['material_id'] == material_id].copy()
        if len(material_data) == 0:
            raise ValueError(f"No data found for material_id {material_id}")

        material_info = InventoryDataGenerator().get_material_info(material_id)
        if material_info is None:
            material_info = {
                'name': f'Material {material_id}',
                'unit': 'Unidades',
                'unit_cost': 100.0
            }

        # Prepare time series
        material_data = material_data.sort_values('date')
        demand_series = material_data['daily_demand'].values

        # Fit ARIMA model
        try:
            model = ARIMA(demand_series, order=(2, 1, 2))
            fitted = model.fit()

            # Forecast
            forecast_result = fitted.get_forecast(steps=forecast_days)
            forecast_mean = forecast_result.predicted_mean
            forecast_conf = forecast_result.conf_int(alpha=0.05)

            # Calculate metrics
            residuals = fitted.resid
            mae = np.mean(np.abs(residuals))
            mape = np.mean(np.abs(residuals / (demand_series[1:] + 1))) * 100

        except Exception as e:
            # Fallback to simple moving average
            window = 30
            forecast_mean = np.full(forecast_days, demand_series[-window:].mean())
            std = demand_series[-window:].std()
            forecast_conf = np.column_stack([
                forecast_mean - 1.96 * std,
                forecast_mean + 1.96 * std
            ])
            mae = std
            mape = (std / demand_series.mean()) * 100

        # Calculate stock projections
        stock_levels = [current_stock]
        for i in range(forecast_days):
            new_stock = stock_levels[-1] - forecast_mean[i]
            stock_levels.append(max(0, new_stock))

        stock_levels = stock_levels[1:]  # Remove initial value

        # Find stockout day
        stockout_day = None
        for i, stock in enumerate(stock_levels):
            if stock <= 0:
                stockout_day = i + 1
                break

        # Calculate recommended order
        total_demand = sum(forecast_mean)
        safety_stock = mae * 1.65 * np.sqrt(lead_time_days)  # 95% service level
        recommended_order = max(0, total_demand + safety_stock - current_stock + reorder_point)

        # Prepare daily forecast
        from datetime import datetime, timedelta
        start_date = datetime.now().date()
        daily_forecast = []
        for i in range(forecast_days):
            daily_forecast.append({
                'date': (start_date + timedelta(days=i+1)).isoformat(),
                'predicted': round(forecast_mean[i], 2),
                'lower': round(max(0, forecast_conf[i, 0]), 2),
                'upper': round(forecast_conf[i, 1], 2),
                'stock_level': round(stock_levels[i], 2),
            })

        return {
            'material': {
                'id': material_id,
                'name': material_info['name'],
                'unit': material_info['unit'],
            },
            'forecast': {
                'predicted_demand_total': round(total_demand, 2),
                'predicted_demand_daily_avg': round(np.mean(forecast_mean), 2),
                'days_until_stockout': stockout_day,
                'recommended_order_quantity': round(recommended_order, 0),
                'safety_stock': round(safety_stock, 2),
            },
            'model_info': {
                'name': 'ARIMA(2,1,2)',
                'mape': round(mape, 2),
                'mae': round(mae, 2),
            },
            'daily_forecast': daily_forecast,
            'historical': material_data.tail(90).to_dict('records'),
        }

    def get_inventory_overview(self) -> Dict:
        """Get inventory overview with alerts."""
        from ml_api.datasets.generators import InventoryDataGenerator

        datasets_dir = settings.ML_DATASETS_DIR
        data = pd.read_csv(datasets_dir / 'inventory_history.csv')
        inv_gen = InventoryDataGenerator()

        alerts = []
        material_summaries = []

        for material_id in data['material_id'].unique():
            material_data = data[data['material_id'] == material_id]
            material_info = inv_gen.get_material_info(material_id)

            latest = material_data.iloc[-1]
            avg_demand = material_data['daily_demand'].mean()
            stock_days = latest['stock_level'] / avg_demand if avg_demand > 0 else 999

            if stock_days < 5:
                alerts.append({
                    'material_id': material_id,
                    'material_name': material_info['name'],
                    'alert_type': 'stockout_imminent',
                    'days_until_stockout': round(stock_days, 1),
                    'recommended_action': f"Ordenar urgentemente"
                })
            elif stock_days < 15:
                alerts.append({
                    'material_id': material_id,
                    'material_name': material_info['name'],
                    'alert_type': 'low_stock',
                    'current_stock_days': round(stock_days, 1),
                    'recommended_action': "Planificar reorden"
                })

            material_summaries.append({
                'material_id': material_id,
                'name': material_info['name'],
                'current_stock': round(latest['stock_level'], 2),
                'avg_daily_demand': round(avg_demand, 2),
                'stock_days': round(stock_days, 1),
                'unit_cost': material_info['unit_cost'],
            })

        total_value = sum(
            m['current_stock'] * m['unit_cost'] for m in material_summaries
        )

        return {
            'materials_analyzed': len(material_summaries),
            'alerts': alerts,
            'summary': {
                'total_inventory_value': round(total_value, 2),
                'items_below_reorder': len([a for a in alerts if a['alert_type'] == 'low_stock']),
                'items_at_risk': len([a for a in alerts if a['alert_type'] == 'stockout_imminent']),
            },
            'materials': material_summaries,
        }

    def get_dashboard(self) -> Dict:
        """Get dashboard summary of all models."""
        return {
            'models_status': [
                {
                    'name': 'Prediccion de Costos',
                    'model': 'Random Forest',
                    'status': 'active' if 'rf_project_cost' in self._models else 'inactive',
                    'accuracy': f"R²: {self._metrics.get('rf_project_cost', {}).get('r2_score', 0)}",
                },
                {
                    'name': 'Prediccion de Duracion',
                    'model': 'Gradient Boosting',
                    'status': 'active' if 'gb_project_duration' in self._models else 'inactive',
                    'accuracy': f"R²: {self._metrics.get('gb_project_duration', {}).get('r2_score', 0)}",
                },
                {
                    'name': 'Segmentacion Clientes',
                    'model': 'K-Means',
                    'status': 'active' if 'kmeans_customers' in self._models else 'inactive',
                    'accuracy': f"Silhouette: {self._metrics.get('kmeans_customers', {}).get('silhouette_score', 0)}",
                },
                {
                    'name': 'Rotacion Personal',
                    'model': 'Logistic Regression',
                    'status': 'active' if 'lr_turnover' in self._models else 'inactive',
                    'accuracy': f"AUC: {self._metrics.get('lr_turnover', {}).get('auc_roc', 0)}",
                },
                {
                    'name': 'Forecast Inventario',
                    'model': 'ARIMA',
                    'status': 'active',
                    'accuracy': 'Dinamico',
                },
            ],
            'all_metrics': self._metrics,
        }

    def retrain_all(self) -> Dict:
        """Retrain all models with fresh data."""
        self._models = {}
        self._scalers = {}
        self._metrics = {}
        self._initialized = False
        self._train_all_models()
        self._initialized = True
        return {'success': True, 'message': 'All models retrained successfully'}
