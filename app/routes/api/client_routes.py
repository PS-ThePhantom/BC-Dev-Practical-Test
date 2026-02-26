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

@api_bp.route("/clients/<string:client_code>/contacts", methods=["GET"])
def get_client_contacts(client_code):
    contacts = ClientService.get_contacts_by_client(client_code)
    if contacts is None:
        return jsonify({"error": "Client not found"}), 404

    contacts_data = [
        {"name": contact.name, "surname":contact.surname, "email": contact.email}
        for contact in contacts
    ]

    return jsonify({"message": "success", "contacts": contacts_data}), 200

@api_bp.route("/clients/<string:client_code>/contacts/unlinked", methods=["GET"])
def get_unlinked_contacts(client_code):
    contacts = ClientService.get_unlinked_contacts(client_code)
    if contacts is None:
        return jsonify({"error": "Client not found"}), 404

    contacts_data = [
        {"name": contact.name, "surname":contact.surname, "email": contact.email}
        for contact in contacts
    ]

    return jsonify({"message": "success", "contacts": contacts_data}), 200

@api_bp.route("/clients/<string:client_code>/contacts/<string:contact_email>", methods=["POST"])
def link_contact_to_client(client_code, contact_email):
    success = ClientService.link_contact_by_email(client_code, contact_email)
    if not success:
        return jsonify({"error": "Failed to link contact"}), 400

    return jsonify({"message": f"Contact with email: '{contact_email}' linked to client {client_code}"}), 201

@api_bp.route("/clients/<string:client_code>/contacts/<string:contact_email>", methods=["DELETE"])
def unlink_contact_from_client(client_code, contact_email):
    success = ClientService.unlink_contact(client_code, contact_email)
    if not success:
        return jsonify({"error": "Failed to unlink contact"}), 400

    return jsonify({"message": f"Contact unlinked from client {client_code}"}), 200