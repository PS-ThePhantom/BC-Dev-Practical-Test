let currentContact = null;

const inputsValid = () => {
    const email = $("#contact-email").val();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const lenName = $("#contact-name").val().length;
    const lenSurname = $("#contact-surname").val().length;

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return false;
    } else if (email.length > 120) {
        alert("email too long, max = 120 characters");
        return false;
    } else if (lenName > 100) {
        alert("name too long, max 100");
        return false;
    } else if (lenSurname > 100) {
        alert("surname too long, max 100");
        return false;
    }

    return true
}

$("#contact-form").submit(function(event) {
    event.preventDefault();

    if (inputsValid()) {
        $("#contact-submit-button").prop("disabled", true);
        $("#contact-submit-button>div").removeClass("hidden");
        $("#contact-submit-button>span").addClass("hidden");

        $.ajax({
            url: "/api/contacts",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                name: $("#contact-name").val(),
                surname: $("#contact-surname").val(),
                email: $("#contact-email").val()
            }),
            success: function(response) {
                $("#contact-name").val("");
                $("#contact-surname").val("");
                $("#contact-email").val("");
                $("#contact-create-success")
                    .text(response.message)
                    .removeClass("text-danger")
                    .addClass("text-success");

                updateContactTable();
            },
            error: function(xhr, status, error) {
                $("#contact-create-success")
                    .text(error)
                    .removeClass("text-success")
                    .addClass("text-danger");
            },
            complete: function() {
                $("#contact-submit-button>div").addClass("hidden");
                $("#contact-submit-button>span").removeClass("hidden");
                $("#contact-submit-button").prop("disabled", false);
                $("#contact-create-success").removeClass("hidden");
            }
        });
    }
});

$("#clients-form").submit(function(event) {
    event.preventDefault();
    $("#client-submit-button").prop("disabled", true);
    $("#client-submit-button>div").removeClass("hidden");
    $("#client-submit-button>span").addClass("hidden");

    const clientCode = $("#client-name").val();
    const contact_email = currentContact.data("contact-email");

    $.ajax({
        url: `/api/clients/${clientCode}/contacts/${contact_email}`,
        method: "POST",
        contentType: "application/json",
        success: function(response) {
            $("#client-name").val("");
            $("#client-link-success")
                .text(response.message)
                .removeClass("text-danger")
                .addClass("text-success");

            updateClientsTable(contact_email);
        },
        error: function(xhr, status, error) {
            $("#client-link-success")
                .text(error)
                .removeClass("text-success")
                .addClass("text-danger");
        },
        complete: function() {
            $("#client-submit-button>div").addClass("hidden");
            $("#client-submit-button>span").removeClass("hidden");
            $("#client-submit-button").prop("disabled", false);
            $("#client-create-success").removeClass("hidden");

            openClientsTab(currentContact);
        }
    });
});

const updateContactTable = () => {
    $("#contact-list-loading").removeClass("hidden");
    $("#existing-contacts-table").addClass("hidden");
    $("#contact-list-error").addClass("hidden");
    
    const tbody = $("#existing-contacts-table tbody");
    tbody.empty();

    $.ajax({
        url: "/api/contacts",
        method: "GET",
        success: function(response) {
            const contacts = response.contacts;

            if (contacts.length == 0) {
                $("#contact-list-error")
                    .text("No contact(s) found.")
                    .removeClass("hidden");
            } else {
                contacts.forEach(contact => {
                    tbody.append(`
                        <tr>
                            <td class="text-start">${contact.name}</td>
                            <td class="text-start">${contact.surname}</td>
                            <td class="text-start">${contact.email}</td>
                            <td class="text-center">${contact.count}</td>
                            <td><button class="btn btn-secondary w-100" data-contact-email="${contact.email}" data-contact-name="${contact.surname} ${contact.name}">View/Link</button></td>
                        </tr>
                    `);
                });

                $("#existing-contacts-table").removeClass("hidden");
            }
        },
        error: function(xhr, status, error) {
            $("#contact-list-error").text("Failed to fetch contacts, " + error).removeClass("hidden");
        },
        complete: function() {
            $("#contact-list-loading").addClass("hidden");
        }
    });
}

const openClientsTab = (contact) => {
    const contactName = contact.data("contact-name");
    const contactEmail = contact.data("contact-email");
    const clientsTab = new bootstrap.Tab($("#clients-tab"));
    const selectInput = $("#client-name");

    $("#link-client-head").text(`Link a client to ${contactName} (${contactEmail})`);
    $("#linked-clients-head").text(`clients linked to ${contactName} (${contactEmail})`);

    selectInput.empty();

    $.ajax({
        url: `/api/contacts/${contactEmail}/clients/unlinked`,
        method: "GET",
        success: function(response) {
            const clients = response.clients;

            if (clients.length == 0) {
                selectInput.append(`
                    <option value="" selected disabled hidden>No clients found</option>
                `);
            } else {
                selectInput.append(`
                    <option value="" selected disabled hidden>Select a client</option>
                `);
                clients.forEach(client => {
                    selectInput.append(`
                        <option value="${client.client_code}">${client.client_code} (${client.name})</option>
                    `);
                });
            }
        },
        error: function(xhr, status, error) {
            $("#contact-create-success")
                .text("cannot fetch contacts list, error:" + error)
                .removeClass("text-success")
                .addClass("text-danger");
        },
        complete: function() {
            clientsTab.show();
            updateClientsTable(contactEmail);
        }
    });
}

const updateClientsTable = (email) => {
    $("#client-list-loading").removeClass("hidden");
    $("#linked-clients-table").addClass("hidden");
    $("#client-list-error").addClass("hidden");
    
    const tbody = $("#linked-clients-table tbody");
    tbody.empty();

    $.ajax({
        url: `/api/contacts/${email}/clients`,
        method: "GET",
        success: function(response) {
            const clients = response.clients;

            if (clients.length == 0) {
                $("#client-list-error")
                    .text("No clients found.")
                    .removeClass("hidden");
            } else {
                clients.forEach(client => {
                    tbody.append(`
                        <tr>
                            <td class="text-start">${client.name}</td>
                            <td class="text-start">${client.client_code}</td>
                            <td class="text-start">
                                <a href="api/clients/${client.client_code}/contacts/${email}">
                                    ${window.location.origin}/api/clients/${client.client_code}/contacts/${email}
                                <a>
                            </td>
                        </tr>
                    `);
                });

                $("#linked-clients-table").removeClass("hidden");
            }
        },
        error: function(xhr, status, error) {
            $("#client-list-error").text("Failed to fetch clients, " + error).removeClass("hidden");
        },
        complete: function() {
            $("#client-list-loading").addClass("hidden");
        }
    });
}

const unlinkClients = (button) => {
    let link = button.attr("href");

    $.ajax({
        url: link,
        type: "DELETE",
        success: function(response) {
            openClientsTab(currentContact);
        },
        error: function(xhr, status, error) {
            alert("Error unlinking client");
        }
    });
}

$(function() {
    updateContactTable();
    
    $("#existing-contacts-table").on("click", "button", function() {
        currentContact = $(this);
        openClientsTab($(this));
    });

    $("#linked-clients-table").on("click", "a", function(event) {
        event.preventDefault();
        unlinkClients($(this));
    });

    $("#general-tab").on("shown.bs.tab", function(event) {
        updateContactTable();
    });
});