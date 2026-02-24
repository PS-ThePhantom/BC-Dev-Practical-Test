from flask import jsonify
from . import api_bp

@api_bp.route("/<path:invalid_path>")
def api_not_found(invalid_path):
    return jsonify({
        "error": "Invalid API endpoint",
        "path": f"/api/{invalid_path}"
    }), 404