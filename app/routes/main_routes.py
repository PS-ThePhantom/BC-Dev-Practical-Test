from flask import render_template
from . import main_bp

@main_bp.route("/", methods=["GET"])
def home():
    return render_template("index.html"), 200

@main_bp.route("/client", methods=["GET"])
def client_page():
    return render_template("client.html"), 200

@main_bp.route("/contact", methods=["GET"])
def contact_page():
    return render_template("contact.html"), 200

@main_bp.route("/<path:invalid_path>")
def page_not_found(invalid_path):
    return "<h1 style='color: red; text-align: center;'>Page Not Found</h1>", 404