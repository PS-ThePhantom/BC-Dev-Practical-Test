from flask import jsonify, request
from . import api_bp

@api_bp.route("/client", methods=["GET"])
def hello_client():
    return jsonify({"message": "not implemented yet"})

@api_bp.route("/client", methods=["POST"])
def create_client():
    name = request.json.get("name")