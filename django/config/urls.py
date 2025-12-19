"""
URL configuration for ML API server.
"""
from django.urls import path, include

urlpatterns = [
    path('api/ml/', include('ml_api.urls')),
]
