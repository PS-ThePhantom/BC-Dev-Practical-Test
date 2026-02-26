# BC Dev Practical Test

A Flask web application for managing clients and contacts.

## Architecture

- **Framework**: Flask (Python)
- **Database**: SQLite via SQLAlchemy (`app.db` in project root)
- **ORM**: Flask-SQLAlchemy with Flask-Migrate for migrations
- **Port**: 5000

## Project Structure

```
app/
  __init__.py         # App factory (create_app)
  config.py           # DevelopmentConfig, TestingConfig
  models/
    client.py         # Client and Contact models + client_contact join table
  routes/
    __init__.py       # main_bp Blueprint
    main_routes.py    # HTML page routes (/, /client, /contact)
    api/
      __init__.py     # api_bp Blueprint (/api prefix)
      api_routes.py   # 404 catch-all
      client_routes.py    # GET/POST /api/clients
      contacts_routes.py  # GET /api/contact (stub)
  services/
    client_service.py   # ClientService (CRUD, code generation)
    contact_service.py  # ContactService (stub)
  static/             # CSS/JS assets
  templates/          # Jinja2 HTML templates
run.py                # Entry point - runs on 0.0.0.0:5000
tests/
  test_client_services.py
```

## Running the App

```bash
python run.py
```

## Database Setup (first run)

The database tables are created automatically via `db.create_all()`. Alternatively use Flask-Migrate:

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Deployment

- Target: autoscale
- Run command: `gunicorn --bind=0.0.0.0:5000 --reuse-port run:app`

## Dependencies

- flask
- flask-sqlalchemy
- flask-migrate
- gunicorn
