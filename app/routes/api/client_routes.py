from flask import jsonify, request
from . import api_bp
from ...services.client_service import ClientService

@api_bp.route("/clients", methods=["GET"])
def get_clients():
    all_clients = ClientService.get_all_clients()
    clients_data = [{"id": client.id, "name": client.name, "client_code": client.client_code, "no_of_contacts": ClientService.get_no_of_contacts(client.id)} for client in all_clients]
    
    return jsonify({"message": "success", "clients": clients_data}), 200

@api_bp.route("/clients", methods=["POST"])
def create_client():
    name = request.json.get("name")
    if not name:
        return jsonify({"error": "Name is required"}), 400

    client = ClientService.create_client(name)
    if not client:
        return jsonify({"error": "Failed to create client"}), 500

    return jsonify({"message": f"Client '{name}' created successfully!", "client_code": client.client_code}), 201