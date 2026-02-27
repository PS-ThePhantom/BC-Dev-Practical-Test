from flask import jsonify, request
from . import api_bp
from ...services.contact_service import ContactService
import re

@api_bp.route("/contacts", methods=["GET"])
def get_contacts():
    all_contacts = ContactService.get_all_contacts()
    contacts_data = [{"surname": contact.surname, "name": contact.name, "email": contact.email, "count": ContactService.get_no_of_linked_clients(contact.email)} for contact in all_contacts]

    return jsonify({"message": "success", "contacts": contacts_data}), 200

@api_bp.route("/contacts", methods=["POST"])
def create_contacts():
    name = request.json.get("name")
    surname = request.json.get("surname")
    email = request.json.get("email")
    emailRegex = r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'

    if not name:
        return jsonify({"error": "Name is required"}), 400
    elif not surname:
        return jsonify({"error": "surname is required"}), 400
    elif not email:
        return jsonify({"error": "email is required"}), 400
    elif len(name) > 100:
        return jsonify({"error": "Name is too long, max = 100 characters"}), 400
    elif len(surname) > 100:
        return jsonify({"error": "Surname is too long, max = 100 characters"}), 400
    elif len(email) > 120:
        return jsonify({"error": "email is too long, max = 120 characters"}), 400
    elif not bool(re.match(emailRegex, email)):
        return jsonify({"error": "contact already exist"}), 400


    if not ContactService.create_contact(name, surname, email):
        return jsonify({"error": "Failed to create client"}), 400

    return jsonify({"message": f"Contact '{surname} {name}' created successfully!"}), 201

@api_bp.route("/contacts/<string:contact_email>/clients/unlinked", methods=["GET"])
def get_unlinked_clients(contact_email):
    clients = ContactService.get_unlinked_clients(contact_email)
    if clients is None:
        return jsonify({"error": "Contact not found"}), 404

    clients_data = [
        {"name": client.name, "client_code": client.client_code}
        for client in clients
    ]

    return jsonify({"message": "success", "clients": clients_data}), 200

@api_bp.route("/contacts/<string:email>/clients", methods=["GET"])
def get_contact_clients(email):
    clients = ContactService.get_clients_by_contact(email)
    if clients is None:
        return jsonify({"error": "Contact not found"}), 404

    clients_data = [
        {"name": client.name, "client_code": client.client_code}
        for client in clients
    ]

    return jsonify({"message": "success", "clients": clients_data}), 200