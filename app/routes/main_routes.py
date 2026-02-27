from flask import render_template
from . import main_bp

@main_bp.route("/", methods=["GET"])
def home():
    return render_template("index.html"), 200

@main_bp.route("/client", methods=["GET"])
def client_page():
    mainTableHeaders = [
        ["Name", "start"],
        ["Client code", "start"],
        ["No. of linked contacts", "center"],
        ["Contacts", "center"]
    ] 

    otherTableHeaders = [
        ["Contact Full Name", "start"],
        ["Contact email address", "start"],
        ["", "start"]
    ]

    return render_template("client.html", mainTab="client", otherTab="contact", mainTableHeaders=mainTableHeaders, otherTableHeaders=otherTableHeaders), 200

@main_bp.route("/contact", methods=["GET"])
def contact_page():
    mainTableHeaders = [
        ["Name", "start"],
        ["Surname", "start"],
        ["Email address", "start"],
        ["No. of linked clients", "center"],
        ["Clients", "center"]
    ]

    otherTableHeaders = [
        ["Client Name", "start"],
        ["Client code", "start"],
        ["", "start"]
    ]

    return render_template("contact.html", mainTab="contact", otherTab="client", mainTableHeaders=mainTableHeaders, otherTableHeaders=otherTableHeaders), 200

@main_bp.route("/<path:invalid_path>")
def page_not_found(invalid_path):
    return "<h1 style='color: red; text-align: center;'>Page Not Found</h1>", 404