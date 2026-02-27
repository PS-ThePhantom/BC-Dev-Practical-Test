from .. import db

client_contact = db.Table(
    "client_contact",
    db.Column("client_id", db.Integer, db.ForeignKey("client.id"), primary_key=True),
    db.Column("contact_id", db.Integer, db.ForeignKey("contact.id"), primary_key=True)
)

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    client_code = db.Column(db.String(6), unique=True, nullable=False, index=True)

    contacts = db.relationship("Contact", secondary=client_contact, back_populates="clients")

    def __repr__(self):
        return f"<Client {self.name}>"

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    surname = db.Column(db.String(100), nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)

    clients = db.relationship("Client", secondary=client_contact, back_populates="contacts")

    def __repr__(self):
        return f"<Contact {self.name} {self.surname}>"