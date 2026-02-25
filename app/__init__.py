from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .routes import main_bp
from .routes.api import api_bp
from .config import DevelopmentConfig

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)

    return app