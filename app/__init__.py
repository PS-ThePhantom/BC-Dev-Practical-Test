from flask import Flask
from .routes import main_bp
from .routes.api import api_bp

def create_app(config_name="development"):
    app = Flask(__name__)

    if config_name == "development":
        app.config["SECRET_KEY"] = "BCDevSecretKey"

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)

    return app