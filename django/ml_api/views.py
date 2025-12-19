"""
ML API Views - REST endpoints for ML predictions and analytics.
"""
from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from ml_api.services.ml_trainer import MLTrainer
from ml_api.services.chart_formatter import ChartFormatter
from ml_api.datasets.generators import (
    ProjectDataGenerator, CustomerDataGenerator,
    EmployeeDataGenerator, InventoryDataGenerator
)


def get_trainer():
    """Get or create ML trainer instance."""
    trainer = MLTrainer()
    if not trainer._initialized:
        trainer.initialize_models()
    return trainer


@api_view(['GET'])
def health_check(request):
    """Health check endpoint."""
    trainer = get_trainer()
    return Response({
        'success': True,
        'service': 'Django ML Server',
        'version': '1.0.0',
        'status': 'operational',
        'models_loaded': {
            'project_cost': 'rf_project_cost' in trainer._models,
            'project_duration': 'gb_project_duration' in trainer._models,
            'customer_segmentation': 'kmeans_customers' in trainer._models,
            'employee_turnover': 'lr_turnover' in trainer._models,
            'inventory_forecast': True,  # ARIMA is dynamic
        },
        'timestamp': datetime.now().isoformat(),
    })


@api_view(['GET'])
def dashboard(request):
    """Get ML dashboard with all models status."""
    try:
        trainer = get_trainer()
        dashboard_data = trainer.get_dashboard()

        # Add chart data
        chart_data = ChartFormatter.format_model_accuracy(dashboard_data['models_status'])

        return Response({
            'success': True,
            **dashboard_data,
            'chart_data': {
                'model_accuracy': chart_data
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def predict_project_cost(request):
    """Predict project cost using Random Forest."""
    try:
        trainer = get_trainer()
        data = request.data

        # Validate required fields
        required_fields = [
            'project_type_id', 'area_m2', 'num_floors', 'location_zone',
            'complexity_score', 'material_quality', 'has_basement', 'has_pool',
            'season_start', 'team_size', 'manager_experience_years'
        ]
        for field in required_fields:
            if field not in data:
                return Response({
                    'success': False,
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Get prediction
        prediction = trainer.predict_project_cost(data)

        # Get feature labels
        gen = ProjectDataGenerator()
        labels = gen.get_feature_labels()

        # Format chart data
        chart_data = {
            'feature_importance': ChartFormatter.format_feature_importance(
                prediction['model_info']['feature_importance'],
                labels
            )
        }

        return Response({
            'success': True,
            'prediction': {
                'predicted_cost': prediction['predicted_cost'],
                'confidence_interval': prediction['confidence_interval'],
                'confidence_level': prediction['confidence_level'],
            },
            'model_info': prediction['model_info'],
            'chart_data': chart_data,
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def predict_project_duration(request):
    """Predict project duration using Gradient Boosting."""
    try:
        trainer = get_trainer()
        data = dict(request.data)

        # Validate required fields
        required_fields = [
            'project_type_id', 'area_m2', 'num_floors', 'complexity_score',
            'team_size', 'manager_experience_years', 'season_start'
        ]

        for field in required_fields:
            if field not in data:
                return Response({
                    'success': False,
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Add defaults for optional fields and convert types
        features = {
            'project_type_id': int(data.get('project_type_id', 2)),
            'area_m2': float(data.get('area_m2', 2500)),
            'num_floors': int(data.get('num_floors', 3)),
            'location_zone': int(data.get('location_zone', 2)),
            'complexity_score': float(data.get('complexity_score', 5)),
            'material_quality': int(data.get('material_quality', 2)),
            'has_basement': bool(data.get('has_basement', False)),
            'has_pool': bool(data.get('has_pool', False)),
            'season_start': int(data.get('season_start', 1)),
            'team_size': int(data.get('team_size', 12)),
            'manager_experience_years': float(data.get('manager_experience_years', 5)),
        }

        # Get prediction
        prediction = trainer.predict_project_duration(features)

        # Calculate estimated end date
        from datetime import datetime, timedelta
        start_date = datetime.now()
        end_date = start_date + timedelta(days=prediction['predicted_days'])

        # Get feature labels
        gen = ProjectDataGenerator()
        labels = gen.get_feature_labels()

        # Format chart data
        chart_data = {
            'feature_importance': ChartFormatter.format_feature_importance(
                prediction['model_info']['feature_importance'],
                labels
            ),
            'duration_distribution': ChartFormatter.format_bar_distribution(
                ['0-60', '61-120', '121-180', '181-240', '241-300', '300+'],
                [45, 120, 180, 95, 40, 20],
                '#2196F3',
                'Distribucion de Duraciones (dias)'
            )
        }

        return Response({
            'success': True,
            'prediction': {
                'predicted_days': prediction['predicted_days'],
                'predicted_months': prediction['predicted_months'],
                'confidence_interval': prediction['confidence_interval'],
                'confidence_level': prediction['confidence_level'],
                'estimated_end_date': end_date.strftime('%Y-%m-%d'),
            },
            'model_info': prediction['model_info'],
            'chart_data': chart_data,
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def analyze_customer_segments(request):
    """Analyze customer segments using K-Means clustering."""
    try:
        trainer = get_trainer()
        analysis = trainer.get_customer_segments()

        # Get segment info
        gen = CustomerDataGenerator()
        segment_info = gen.get_segment_info()

        # Enhance segments with additional info
        for segment in analysis['segments']:
            info = segment_info.get(segment['segment_id'], {})
            segment['description'] = info.get('description', '')
            segment['icon'] = info.get('icon', 'category')

        # Format chart data
        segment_names = [s['name'] for s in analysis['segments']]
        segment_counts = [s['count'] for s in analysis['segments']]
        segment_colors = [s['color'] for s in analysis['segments']]

        # Radar data - normalize characteristics to 0-100 scale
        radar_datasets = []
        max_values = {
            'avg_revenue': max(s['characteristics']['avg_revenue'] for s in analysis['segments']),
            'avg_projects': max(s['characteristics']['avg_projects'] for s in analysis['segments']),
            'avg_tenure_months': max(s['characteristics']['avg_tenure_months'] for s in analysis['segments']),
            'avg_satisfaction': 10,
        }

        for segment in analysis['segments']:
            chars = segment['characteristics']
            radar_datasets.append({
                'label': segment['name'],
                'data': [
                    round(chars['avg_revenue'] / max_values['avg_revenue'] * 100, 1),
                    round(chars['avg_projects'] / max_values['avg_projects'] * 100, 1),
                    round(chars['avg_tenure_months'] / max_values['avg_tenure_months'] * 100, 1),
                    round((15 - chars['avg_payment_delay']) / 15 * 100, 1),  # Inverse: less delay = better
                    round(chars['avg_satisfaction'] / max_values['avg_satisfaction'] * 100, 1),
                ],
                'color': segment['color']
            })

        chart_data = {
            'segment_distribution': ChartFormatter.format_doughnut(
                segment_names, segment_counts, segment_colors, 'Distribucion de Clientes'
            ),
            'segment_radar': ChartFormatter.format_radar(
                ['Revenue', 'Frecuencia', 'Antiguedad', 'Puntualidad', 'Satisfaccion'],
                radar_datasets,
                'Caracteristicas por Segmento'
            ),
            'cluster_scatter': ChartFormatter.format_cluster_scatter(
                analysis['raw_data'],
                'total_revenue',
                'num_projects',
                'cluster',
                segment_names,
                segment_colors,
                'Segmentacion de Clientes'
            )
        }

        # Remove raw data from response (too large)
        del analysis['raw_data']

        return Response({
            'success': True,
            'analysis': {
                'total_customers': analysis['total_customers'],
                'num_clusters': analysis['num_clusters'],
                'silhouette_score': analysis['silhouette_score'],
            },
            'segments': analysis['segments'],
            'chart_data': chart_data,
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def predict_employee_turnover(request):
    """Predict employee turnover probability using Logistic Regression."""
    try:
        trainer = get_trainer()
        data = request.data

        # Validate required fields
        required_fields = [
            'tenure_months', 'age', 'salary_level', 'department',
            'performance_score', 'overtime_hours_monthly', 'distance_from_home_km',
            'num_promotions', 'training_hours_yearly', 'satisfaction_score',
            'num_projects_assigned'
        ]
        for field in required_fields:
            if field not in data:
                return Response({
                    'success': False,
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Get prediction
        prediction = trainer.predict_employee_turnover(data)

        # Get feature labels
        gen = EmployeeDataGenerator()
        labels = gen.get_feature_labels()

        # Format chart data
        risk_factors = prediction['risk_factors']
        factor_labels = [labels.get(f['factor'], f['factor']) for f in risk_factors]
        factor_values = [f['contribution'] for f in risk_factors]

        chart_data = {
            'risk_gauge': ChartFormatter.format_gauge(
                prediction['turnover_probability'],
                'Probabilidad de Rotacion',
                prediction['risk_color']
            ),
            'factor_contribution': ChartFormatter.format_horizontal_bar(
                factor_labels,
                factor_values,
                title='Factores de Riesgo'
            )
        }

        return Response({
            'success': True,
            'prediction': {
                'turnover_probability': prediction['turnover_probability'],
                'risk_level': prediction['risk_level'],
                'risk_color': prediction['risk_color'],
                'recommendation': 'Accion inmediata requerida' if prediction['risk_level'] == 'high' else (
                    'Monitorear de cerca' if prediction['risk_level'] == 'medium' else 'Sin accion requerida'
                )
            },
            'risk_factors': prediction['risk_factors'],
            'model_info': prediction['model_info'],
            'chart_data': chart_data,
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def analyze_turnover_overview(request):
    """Get overview of turnover predictions for all employees."""
    try:
        trainer = get_trainer()
        overview = trainer.get_turnover_overview()

        # Format chart data
        chart_data = {
            'risk_distribution': ChartFormatter.format_doughnut(
                ['Bajo Riesgo', 'Riesgo Medio', 'Alto Riesgo'],
                [overview['low_risk'], overview['medium_risk'], overview['high_risk']],
                ['#4CAF50', '#FF9800', '#F44336'],
                'Distribucion de Riesgo'
            ),
            'turnover_by_department': ChartFormatter.format_bar_distribution(
                ['Operaciones', 'Ventas', 'Admin', 'Ingenieria', 'RRHH', 'Finanzas'],
                [28, 22, 15, 12, 18, 10],  # Simulated rates
                '#2196F3',
                'Tasa de Rotacion por Departamento (%)'
            )
        }

        return Response({
            'success': True,
            'overview': {
                'total_employees': overview['total_employees'],
                'predicted_at_risk': overview['predicted_at_risk'],
                'high_risk': overview['high_risk'],
                'medium_risk': overview['medium_risk'],
                'low_risk': overview['low_risk'],
                'overall_turnover_rate': overview['overall_turnover_rate'],
            },
            'chart_data': chart_data,
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def forecast_inventory(request):
    """Forecast inventory demand using ARIMA."""
    try:
        trainer = get_trainer()
        data = request.data

        # Validate required fields
        required_fields = [
            'material_id', 'forecast_days', 'current_stock',
            'reorder_point', 'lead_time_days'
        ]
        for field in required_fields:
            if field not in data:
                return Response({
                    'success': False,
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Get forecast
        forecast = trainer.forecast_inventory(
            material_id=int(data['material_id']),
            forecast_days=int(data['forecast_days']),
            current_stock=float(data['current_stock']),
            reorder_point=float(data['reorder_point']),
            lead_time_days=int(data['lead_time_days']),
        )

        # Extract data for charts
        daily = forecast['daily_forecast']
        dates = [d['date'] for d in daily]
        predicted = [d['predicted'] for d in daily]
        lower = [d['lower'] for d in daily]
        upper = [d['upper'] for d in daily]
        stock_levels = [d['stock_level'] for d in daily]

        # Historical data
        historical = forecast.get('historical', [])
        hist_dates = [h['date'] for h in historical[-30:]]  # Last 30 days
        hist_demand = [h['daily_demand'] for h in historical[-30:]]

        # Get seasonality pattern
        gen = InventoryDataGenerator()
        seasonality = gen.get_seasonality_pattern(int(data['material_id']))

        # Format chart data
        chart_data = {
            'demand_forecast': ChartFormatter.format_line_forecast(
                dates, predicted, lower, upper,
                hist_demand, hist_dates,
                'Pronostico de Demanda'
            ),
            'stock_projection': ChartFormatter.format_stock_projection(
                dates, stock_levels,
                float(data['reorder_point']),
                forecast['forecast']['safety_stock'],
                'Proyeccion de Stock'
            ),
            'seasonality_pattern': ChartFormatter.format_seasonality(
                seasonality['labels'],
                seasonality['values'],
                f"Patron Estacional - {forecast['material']['name']}"
            )
        }

        # Calculate stockout date if applicable
        stockout_date = None
        if forecast['forecast']['days_until_stockout']:
            from datetime import datetime, timedelta
            stockout_date = (
                datetime.now() + timedelta(days=forecast['forecast']['days_until_stockout'])
            ).strftime('%Y-%m-%d')

        return Response({
            'success': True,
            'material': forecast['material'],
            'forecast': {
                **forecast['forecast'],
                'stockout_date': stockout_date,
                'recommended_order_date': (
                    datetime.now() + timedelta(
                        days=max(0, (forecast['forecast']['days_until_stockout'] or 30) - int(data['lead_time_days']) - 2)
                    )
                ).strftime('%Y-%m-%d') if forecast['forecast']['days_until_stockout'] else None,
            },
            'model_info': forecast['model_info'],
            'daily_forecast': forecast['daily_forecast'][:14],  # First 2 weeks
            'chart_data': chart_data,
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def analyze_inventory_overview(request):
    """Get inventory overview with alerts."""
    try:
        trainer = get_trainer()
        overview = trainer.get_inventory_overview()

        return Response({
            'success': True,
            **overview,
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def regenerate_datasets(request):
    """Regenerate all datasets."""
    try:
        from django.conf import settings

        gen_project = ProjectDataGenerator(seed=42)
        gen_customer = CustomerDataGenerator(seed=42)
        gen_employee = EmployeeDataGenerator(seed=42)
        gen_inventory = InventoryDataGenerator(seed=42)

        datasets_dir = settings.ML_DATASETS_DIR

        gen_project.generate(500).to_csv(datasets_dir / 'projects.csv', index=False)
        gen_customer.generate(300).to_csv(datasets_dir / 'customers.csv', index=False)
        gen_employee.generate(400).to_csv(datasets_dir / 'employees.csv', index=False)
        gen_inventory.generate(730).to_csv(datasets_dir / 'inventory_history.csv', index=False)

        return Response({
            'success': True,
            'message': 'Datasets regenerated successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def retrain_models(request):
    """Retrain all ML models."""
    try:
        trainer = get_trainer()
        result = trainer.retrain_all()

        return Response({
            'success': True,
            'message': result['message']
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
