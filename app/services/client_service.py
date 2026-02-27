from .. import db
from ..models.client import Client, Contact, client_contact 
from sqlalchemy import func
import string

class ClientService:

    @staticmethod
    def fill_word(word: str, target_length: int = 3) -> str:
        needed = target_length - len(word)
        alphabet = string.ascii_uppercase
        return word + alphabet[:needed]

    @staticmethod
    def normalize_name(name: str) -> str:
        words = name.strip().upper().split()

        #if the name is a single word
        if len(words) == 1 and len(name) < 3:
            return ClientService.fill_word(words[0])
        
        if len(words) == 1:
            return words[0][:3]
        
        #if the name has 3 or more words 
        if len(words) >= 3:
            return "".join(word[0] for word in words)
        
        #if the name has 2 words
        if len(words[0]) == 1 and len(words[1]) == 1:
            name = words[0][0] + words[1][0]
            return ClientService.fill_word(name)
            
        if len(words[1]) > 1:
            return  words[0][0] + words[1][:2]
            
        return  words[0][:2] + words[1][0]
    
    @staticmethod
    def generate_client_code(prefix: str) -> str:

        existing = Client.query.filter(Client.client_code.like(f"{prefix}%")).all()
        if not existing:
            return prefix + "001"
        
        numbers = []
        for client in existing:
            suffix = client.client_code[len(prefix):]
            if suffix.isdigit():
                numbers.append(int(suffix))

        next_number = max(numbers) + 1 if numbers else 1
        return f"{prefix}{str(next_number).zfill(3)}"
    
    @staticmethod
    def create_client(name: str) -> str:
        prefix = ClientService.normalize_name(name)
        client_code = ClientService.generate_client_code(prefix)
        client = Client(name=name, client_code=client_code)
        db.session.add(client)
        db.session.commit()
        return client
    
    @staticmethod
    def get_all_clients():
        return Client.query.order_by(Client.name).all()
    
    @staticmethod
    def get_no_of_linked_Contacts(client_id: int) -> int:
        client = Client.query.get(client_id)
        if not client:
            return 0
        return len(client.contacts)
    
    @staticmethod
    def get_no_of_contacts(client_id: int) -> int:
        number_of_contacts = (
            db.session.query(func.count(client_contact.c.contact_id))
            .filter(client_contact.c.client_id == client_id)
            .scalar()
        )
        
        return number_of_contacts
    
    @staticmethod
    def get_contacts_by_client(client_code: str):
        client = Client.query.filter_by(client_code=client_code).first()
        if not client:
            return None

        return (
            Contact.query
            .join(client_contact, Contact.id == client_contact.c.contact_id)
            .filter(client_contact.c.client_id == client.id)
            .order_by(Contact.surname, Contact.name)
            .all()
        )

    
    @staticmethod
    def get_unlinked_contacts(client_code: str):
        client = Client.query.filter_by(client_code=client_code).first()
        if not client:
            return None

        linked_ids = [contact.id for contact in client.contacts]

        if linked_ids:
            unlinked_contacts = (
                Contact.query
                .filter(~Contact.id.in_(linked_ids))
                .order_by(Contact.surname, Contact.name)
                .all()
            )
        else:
            unlinked_contacts = (
                Contact.query
                .order_by(Contact.surname, Contact.name)
                .all()
            )

        return unlinked_contacts
    
    @staticmethod
    def link_contact(client_code: str, contact_email: str) -> bool:
        client = Client.query.filter_by(client_code=client_code).first()
        if not client:
            return False

        contact = Contact.query.filter_by(email=contact_email).first()
        if not contact:
            return False

        if contact in client.contacts:
            return False

        client.contacts.append(contact)
        db.session.commit()
        return True
    
    @staticmethod
    def unlink_contact(client_code: str, contact_email: str) -> bool:
        client = Client.query.filter_by(client_code=client_code).first()
        if not client:
            return False

        contact = Contact.query.filter_by(email=contact_email).first()
        if not contact:
            return False

        if contact not in client.contacts:
            return False

        client.contacts.remove(contact)
        db.session.commit()
        return True
