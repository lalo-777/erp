"""
URL routes for ML API endpoints.
"""
from django.urls import path
from ml_api import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),

    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),

    # Predictions
    path('predict/project-cost/', views.predict_project_cost, name='predict_project_cost'),
    path('predict/project-duration/', views.predict_project_duration, name='predict_project_duration'),
    path('predict/employee-turnover/', views.predict_employee_turnover, name='predict_employee_turnover'),

    # Analysis
    path('analyze/customer-segments/', views.analyze_customer_segments, name='analyze_customer_segments'),
    path('analyze/turnover-overview/', views.analyze_turnover_overview, name='analyze_turnover_overview'),
    path('analyze/inventory-overview/', views.analyze_inventory_overview, name='analyze_inventory_overview'),

    # Forecast
    path('forecast/inventory/', views.forecast_inventory, name='forecast_inventory'),

    # Dataset management
    path('datasets/regenerate/', views.regenerate_datasets, name='regenerate_datasets'),
    path('datasets/retrain/', views.retrain_models, name='retrain_models'),
]
