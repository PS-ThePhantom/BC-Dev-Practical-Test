from .. import db
from ..models.client import Client, client_contact
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