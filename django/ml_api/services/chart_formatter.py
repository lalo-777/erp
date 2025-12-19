"""
Chart Formatter Service - Formats data for Chart.js visualizations.
"""
from typing import Dict, List, Any
import numpy as np


class ChartFormatter:
    """Service for formatting data into Chart.js compatible format."""

    @staticmethod
    def format_feature_importance(importance: Dict[str, float], labels: Dict[str, str] = None) -> Dict:
        """Format feature importance for horizontal bar chart."""
        sorted_items = sorted(importance.items(), key=lambda x: x[1], reverse=True)

        feature_names = [item[0] for item in sorted_items]
        values = [item[1] for item in sorted_items]

        if labels:
            display_labels = [labels.get(f, f) for f in feature_names]
        else:
            display_labels = feature_names

        colors = [
            '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
            '#00BCD4', '#E91E63', '#795548', '#607D8B',
            '#FFC107', '#3F51B5', '#009688'
        ]

        return {
            'type': 'bar',
            'data': {
                'labels': display_labels,
                'datasets': [{
                    'label': 'Importancia de Variables',
                    'data': [round(v, 4) for v in values],
                    'backgroundColor': colors[:len(values)],
                    'borderWidth': 1,
                }]
            },
            'options': {
                'indexAxis': 'y',
                'responsive': True,
                'plugins': {
                    'legend': {'display': False},
                    'title': {
                        'display': True,
                        'text': 'Importancia de Variables'
                    }
                },
                'scales': {
                    'x': {
                        'beginAtZero': True,
                        'max': 1,
                    }
                }
            }
        }

    @staticmethod
    def format_prediction_scatter(y_true: List, y_pred: List, label: str = 'Predicciones') -> Dict:
        """Format actual vs predicted values for scatter plot."""
        data_points = [{'x': float(t), 'y': float(p)} for t, p in zip(y_true, y_pred)]

        # Calculate perfect prediction line
        min_val = min(min(y_true), min(y_pred))
        max_val = max(max(y_true), max(y_pred))

        return {
            'type': 'scatter',
            'data': {
                'datasets': [
                    {
                        'label': label,
                        'data': data_points,
                        'backgroundColor': 'rgba(33, 150, 243, 0.6)',
                        'borderColor': '#2196F3',
                        'pointRadius': 4,
                    },
                    {
                        'label': 'Linea Perfecta',
                        'data': [{'x': min_val, 'y': min_val}, {'x': max_val, 'y': max_val}],
                        'type': 'line',
                        'borderColor': '#F44336',
                        'borderDash': [5, 5],
                        'pointRadius': 0,
                        'fill': False,
                    }
                ]
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'title': {
                        'display': True,
                        'text': 'Predicciones vs Valores Reales'
                    }
                },
                'scales': {
                    'x': {'title': {'display': True, 'text': 'Valor Real'}},
                    'y': {'title': {'display': True, 'text': 'Prediccion'}}
                }
            }
        }

    @staticmethod
    def format_doughnut(labels: List[str], values: List[float], colors: List[str], title: str = '') -> Dict:
        """Format data for doughnut/pie chart."""
        return {
            'type': 'doughnut',
            'data': {
                'labels': labels,
                'datasets': [{
                    'data': values,
                    'backgroundColor': colors,
                    'borderWidth': 2,
                    'borderColor': '#fff',
                }]
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'legend': {
                        'position': 'right',
                    },
                    'title': {
                        'display': bool(title),
                        'text': title
                    }
                },
                'cutout': '60%',
            }
        }

    @staticmethod
    def format_radar(labels: List[str], datasets: List[Dict], title: str = '') -> Dict:
        """Format data for radar chart."""
        formatted_datasets = []
        for ds in datasets:
            formatted_datasets.append({
                'label': ds['label'],
                'data': ds['data'],
                'borderColor': ds['color'],
                'backgroundColor': f"{ds['color']}33",  # 20% opacity
                'borderWidth': 2,
                'pointBackgroundColor': ds['color'],
            })

        return {
            'type': 'radar',
            'data': {
                'labels': labels,
                'datasets': formatted_datasets
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'title': {
                        'display': bool(title),
                        'text': title
                    }
                },
                'scales': {
                    'r': {
                        'beginAtZero': True,
                        'max': 100,
                    }
                }
            }
        }

    @staticmethod
    def format_gauge(value: float, label: str = 'Valor', color: str = '#F44336') -> Dict:
        """Format data for gauge chart (semi-doughnut)."""
        remaining = 100 - (value * 100)
        return {
            'type': 'doughnut',
            'data': {
                'labels': [label, ''],
                'datasets': [{
                    'data': [value * 100, remaining],
                    'backgroundColor': [color, '#E0E0E0'],
                    'borderWidth': 0,
                }]
            },
            'options': {
                'responsive': True,
                'circumference': 180,
                'rotation': 270,
                'cutout': '75%',
                'plugins': {
                    'legend': {'display': False},
                    'tooltip': {'enabled': False},
                }
            }
        }

    @staticmethod
    def format_line_forecast(
        dates: List[str],
        predicted: List[float],
        lower: List[float] = None,
        upper: List[float] = None,
        historical: List[float] = None,
        historical_dates: List[str] = None,
        title: str = ''
    ) -> Dict:
        """Format data for forecast line chart with confidence intervals."""
        datasets = []

        # Predicted line
        datasets.append({
            'label': 'Pronostico',
            'data': predicted,
            'borderColor': '#2196F3',
            'backgroundColor': 'rgba(33, 150, 243, 0.1)',
            'fill': False,
            'tension': 0.1,
        })

        # Confidence interval
        if upper:
            datasets.append({
                'label': 'Limite Superior (95%)',
                'data': upper,
                'borderColor': 'rgba(33, 150, 243, 0.3)',
                'borderDash': [5, 5],
                'fill': False,
                'pointRadius': 0,
            })

        if lower:
            datasets.append({
                'label': 'Limite Inferior (95%)',
                'data': lower,
                'borderColor': 'rgba(33, 150, 243, 0.3)',
                'borderDash': [5, 5],
                'fill': '-1',
                'backgroundColor': 'rgba(33, 150, 243, 0.1)',
                'pointRadius': 0,
            })

        all_labels = dates
        if historical_dates and historical:
            # Combine historical and forecast
            all_labels = historical_dates + dates
            historical_full = historical + [None] * len(dates)
            datasets.insert(0, {
                'label': 'Historico',
                'data': historical_full,
                'borderColor': '#9E9E9E',
                'fill': False,
                'tension': 0.1,
            })
            # Pad forecast data
            for ds in datasets[1:]:
                ds['data'] = [None] * len(historical) + ds['data']

        return {
            'type': 'line',
            'data': {
                'labels': all_labels,
                'datasets': datasets
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'title': {
                        'display': bool(title),
                        'text': title
                    }
                },
                'scales': {
                    'x': {
                        'title': {'display': True, 'text': 'Fecha'}
                    },
                    'y': {
                        'title': {'display': True, 'text': 'Demanda'},
                        'beginAtZero': True,
                    }
                }
            }
        }

    @staticmethod
    def format_stock_projection(
        dates: List[str],
        stock_levels: List[float],
        reorder_point: float,
        safety_stock: float = None,
        title: str = ''
    ) -> Dict:
        """Format stock projection chart with reorder point line."""
        datasets = [
            {
                'label': 'Nivel de Stock',
                'data': stock_levels,
                'borderColor': '#4CAF50',
                'backgroundColor': 'rgba(76, 175, 80, 0.2)',
                'fill': True,
                'tension': 0.1,
            },
            {
                'label': 'Punto de Reorden',
                'data': [reorder_point] * len(dates),
                'borderColor': '#FF9800',
                'borderDash': [10, 5],
                'fill': False,
                'pointRadius': 0,
            }
        ]

        if safety_stock:
            datasets.append({
                'label': 'Stock de Seguridad',
                'data': [safety_stock] * len(dates),
                'borderColor': '#F44336',
                'borderDash': [5, 5],
                'fill': False,
                'pointRadius': 0,
            })

        return {
            'type': 'line',
            'data': {
                'labels': dates,
                'datasets': datasets
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'title': {
                        'display': bool(title),
                        'text': title
                    }
                },
                'scales': {
                    'y': {
                        'beginAtZero': True,
                        'title': {'display': True, 'text': 'Unidades'}
                    }
                }
            }
        }

    @staticmethod
    def format_horizontal_bar(
        labels: List[str],
        values: List[float],
        colors: List[str] = None,
        title: str = ''
    ) -> Dict:
        """Format horizontal bar chart for risk factors."""
        if colors is None:
            # Generate colors based on values (higher = more red)
            colors = []
            for v in values:
                if v > 0.15:
                    colors.append('#F44336')
                elif v > 0.08:
                    colors.append('#FF9800')
                else:
                    colors.append('#4CAF50')

        return {
            'type': 'bar',
            'data': {
                'labels': labels,
                'datasets': [{
                    'label': 'Contribucion al Riesgo',
                    'data': values,
                    'backgroundColor': colors,
                    'borderWidth': 1,
                }]
            },
            'options': {
                'indexAxis': 'y',
                'responsive': True,
                'plugins': {
                    'legend': {'display': False},
                    'title': {
                        'display': bool(title),
                        'text': title
                    }
                },
                'scales': {
                    'x': {
                        'beginAtZero': True,
                    }
                }
            }
        }

    @staticmethod
    def format_bar_distribution(
        labels: List[str],
        values: List[int],
        color: str = '#2196F3',
        title: str = ''
    ) -> Dict:
        """Format bar chart for distribution."""
        return {
            'type': 'bar',
            'data': {
                'labels': labels,
                'datasets': [{
                    'label': 'Cantidad',
                    'data': values,
                    'backgroundColor': color,
                    'borderWidth': 1,
                }]
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'legend': {'display': False},
                    'title': {
                        'display': bool(title),
                        'text': title
                    }
                },
                'scales': {
                    'y': {
                        'beginAtZero': True,
                    }
                }
            }
        }

    @staticmethod
    def format_cluster_scatter(
        data: List[Dict],
        x_field: str,
        y_field: str,
        cluster_field: str,
        cluster_names: List[str],
        cluster_colors: List[str],
        title: str = ''
    ) -> Dict:
        """Format scatter plot for clustering visualization."""
        datasets = []

        for i, (name, color) in enumerate(zip(cluster_names, cluster_colors)):
            points = [
                {'x': d[x_field], 'y': d[y_field]}
                for d in data if d.get(cluster_field) == i
            ]
            datasets.append({
                'label': name,
                'data': points,
                'backgroundColor': f"{color}AA",
                'borderColor': color,
                'pointRadius': 5,
            })

        return {
            'type': 'scatter',
            'data': {
                'datasets': datasets
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'title': {
                        'display': bool(title),
                        'text': title
                    }
                },
                'scales': {
                    'x': {
                        'type': 'logarithmic',
                        'title': {'display': True, 'text': x_field}
                    },
                    'y': {
                        'title': {'display': True, 'text': y_field}
                    }
                }
            }
        }

    @staticmethod
    def format_seasonality(labels: List[str], values: List[float], title: str = '') -> Dict:
        """Format seasonality pattern chart."""
        return {
            'type': 'line',
            'data': {
                'labels': labels,
                'datasets': [{
                    'label': 'Patron Estacional',
                    'data': values,
                    'borderColor': '#9C27B0',
                    'backgroundColor': 'rgba(156, 39, 176, 0.2)',
                    'fill': True,
                    'tension': 0.4,
                }]
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'title': {
                        'display': bool(title),
                        'text': title
                    }
                },
                'scales': {
                    'y': {
                        'title': {'display': True, 'text': 'Demanda Promedio'}
                    }
                }
            }
        }

    @staticmethod
    def format_model_accuracy(models: List[Dict]) -> Dict:
        """Format model accuracy comparison bar chart."""
        labels = [m['name'] for m in models]
        values = []
        colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4']

        for m in models:
            accuracy_str = m.get('accuracy', '0')
            # Extract numeric value
            try:
                val = float(accuracy_str.split(':')[-1].strip())
                values.append(val * 100 if val <= 1 else val)
            except:
                values.append(0)

        return {
            'type': 'bar',
            'data': {
                'labels': labels,
                'datasets': [{
                    'label': 'Precision del Modelo (%)',
                    'data': values,
                    'backgroundColor': colors[:len(values)],
                    'borderWidth': 1,
                }]
            },
            'options': {
                'responsive': True,
                'plugins': {
                    'legend': {'display': False},
                    'title': {
                        'display': True,
                        'text': 'Comparacion de Modelos'
                    }
                },
                'scales': {
                    'y': {
                        'beginAtZero': True,
                        'max': 100,
                        'title': {'display': True, 'text': 'Precision (%)'}
                    }
                }
            }
        }
