from flask import render_template, jsonify
from . import main_bp

@main_bp.route("/")
def home():
    return "<h1>Welcome to your Flask App!</h1>"