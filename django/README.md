# Django ML Server

Servidor Django para Machine Learning demostrativo del ERP.

## Modelos Implementados

1. **Random Forest Regressor** - Prediccion de costos de proyecto
2. **Gradient Boosting Regressor** - Prediccion de duracion de proyecto
3. **K-Means Clustering** - Segmentacion de clientes
4. **Logistic Regression** - Prediccion de rotacion de personal
5. **ARIMA** - Forecast de demanda de inventario

## Instalacion

```bash
cd D:\erp\servidor\django

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## Ejecucion

```bash
# Activar entorno virtual si no esta activo
venv\Scripts\activate

# Iniciar servidor (puerto 8000)
python manage.py runserver
```

El servidor estara disponible en: http://localhost:8000

## Endpoints API

Base URL: `http://localhost:8000/api/ml/`

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/health/` | GET | Health check |
| `/dashboard/` | GET | Dashboard con estado de modelos |
| `/predict/project-cost/` | POST | Prediccion de costo |
| `/predict/project-duration/` | POST | Prediccion de duracion |
| `/predict/employee-turnover/` | POST | Prediccion de rotacion |
| `/analyze/customer-segments/` | GET | Analisis de segmentacion |
| `/analyze/turnover-overview/` | GET | Overview de rotacion |
| `/analyze/inventory-overview/` | GET | Overview de inventario |
| `/forecast/inventory/` | POST | Forecast de inventario |
| `/datasets/regenerate/` | POST | Regenerar datasets |
| `/datasets/retrain/` | POST | Reentrenar modelos |

## Datasets Generados

Los datasets se generan automaticamente al iniciar el servidor:
- `projects.csv` - 500 registros
- `customers.csv` - 300 registros
- `employees.csv` - 400 registros
- `inventory_history.csv` - 730 registros (2 anos)

## Notas

- Los modelos se entrenan automaticamente al primer inicio
- Los modelos entrenados se guardan en `/trained_models/`
- Los datasets se guardan en `/ml_api/datasets/data/`
