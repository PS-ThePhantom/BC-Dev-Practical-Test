import pytest
from app import create_app, db
from app.services import ClientService
from app.config import TestingConfig

@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_create_client(app):
    with app.app_context():
        client = ClientService.create_client("Test Client")
        assert client.id is not None
        assert client.name == "Test Client"
        assert len(client.client_code) == 6
        assert client.client_code == "TCL001"

        client2 = ClientService.create_client("Test Client")
        assert client2.client_code == "TCL002"

        Client3 = ClientService.create_client("first National Bank")
        assert Client3.client_code == "FNB001"

        Client4 = ClientService.create_client("IT")
        assert Client4.client_code == "ITA001"

        Client5 = ClientService.create_client("I")
        assert Client5.client_code == "IAA001"

        Client6 = ClientService.create_client("Amazon W")
        assert Client6.client_code == "AMW001"

        Client7 = ClientService.create_client("A W")
        assert Client7.client_code == "AWA001"

        client_code = ''
        for i in range(1000):
            client_code = ClientService.create_client('A').client_code

        assert client_code == "AAB001"


def test_get_all_clients(app):
    with app.app_context():
        ClientService.create_client("Client A")
        ClientService.create_client("Client B")
        clients = ClientService.get_all_clients()
        assert len(clients) == 2
        names = [c.name for c in clients]
        assert "Client A" in names
        assert "Client B" in names