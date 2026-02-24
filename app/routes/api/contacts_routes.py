from flask import jsonify
from . import api_bp

@api_bp.route("/contact", methods=["GET"])
def hello_contact():
    return jsonify({"message": "not implemented yet"})