from django.apps import AppConfig


class MlApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ml_api'
    verbose_name = 'ML Analytics API'

    def ready(self):
        # Initialize ML models when app is ready
        from ml_api.services.ml_trainer import MLTrainer
        trainer = MLTrainer()
        trainer.initialize_models()
