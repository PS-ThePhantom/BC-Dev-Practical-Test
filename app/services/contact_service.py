from .. import db
from ..models.client import Contact, Client, client_contact
from sqlalchemy import func

class ContactService:
    @staticmethod
    def create_contact(name: str, surname: str, email: str) -> bool:
        existing = Contact.query.filter_by(email=email).first()
        if existing:
            return False

        contact = Contact(name=name, surname=surname, email=email)
        db.session.add(contact)
        db.session.commit()
        return True
    
    @staticmethod
    def get_all_contacts():
        return Contact.query.order_by(func.lower(Contact.surname), func.lower(Contact.name)).all()

    @staticmethod
    def get_no_of_linked_clients(email: str) -> int:
        contact = Contact.query.filter_by(email=email).first()
        if not contact:
            return 0
        
        return len(contact.clients)
    
    @staticmethod
    def get_unlinked_clients(contact_email: str):
        contact = Contact.query.filter_by(email=contact_email).first()
        if not contact:
            return None

        linked_ids = [client.id for client in contact.clients]

        if linked_ids:
            unlinked_clients = (
                Client.query
                .filter(~Client.id.in_(linked_ids))
                .order_by(func.lower(Client.name))
                .all()
            )
        else:
            unlinked_clients = (
                Client.query
                .order_by(func.lower(Client.name))
                .all()
            )

        return unlinked_clients
    
    @staticmethod
    def get_clients_by_contact(email: str):
        contact = Contact.query.filter_by(email=email).first()
        if not contact:
            return None

        return (
            Client.query
            .join(client_contact, Client.id == client_contact.c.client_id)
            .filter(client_contact.c.contact_id == contact.id)
            .order_by(func.lower(Client.name))
            .all()
        )
