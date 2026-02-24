from flask import jsonify
from . import api_bp

@api_bp.route("/client", methods=["GET"])
def hello_client():
    return jsonify({"message": "not implemented yet"})