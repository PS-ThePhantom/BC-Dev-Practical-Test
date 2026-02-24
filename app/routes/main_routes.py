from flask import render_template
from . import main_bp

@main_bp.route("/", methods=["GET"])
def home():
    return "<h1>Welcome to your Flask App!</h1>", 200

@main_bp.route("/<path:invalid_path>")
def page_not_found(invalid_path):
    return "<h1 style='color: red; text-align: center;'>Page Not Found</h1>", 404