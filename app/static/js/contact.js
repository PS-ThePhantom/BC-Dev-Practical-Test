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

                updateContactTableCC();
            },
            error: function(xhr, status, error) {
                $("#contact-create-success")
                    .text("falied to create contact, email already exists")
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

    const clientCode = $("#client-select-name").val();
    const contact_email = currentContact.data("contact-email");

    $.ajax({
        url: `/api/clients/${clientCode}/contacts/${contact_email}`,
        method: "POST",
        contentType: "application/json",
        success: function(response) {
            $("#client-select-name").val("");
            $("#client-link-success")
                .text(response.message)
                .removeClass("text-danger")
                .addClass("text-success");

            updateClientsTableCC(contact_email);
            updateContactTableCC();
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
            $("#client-link-success").removeClass("hidden");

            openClientsTabCC(currentContact);
        }
    });
});

const updateContactTableCC = () => {
    $("#contact-list-loading").removeClass("hidden");
    $("#existing-contacts-table").addClass("hidden");
    $("#contact-list-error").addClass("hidden");
    
    const tbody = $("#existing-contacts-table tbody");
    const nameFilter = $("#filter-contact-table").val().trim();

    tbody.empty();

    $.ajax({
        url: "/api/contacts",
        method: "GET",
        data: {name: nameFilter},
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

const openClientsTabCC = (contact) => {
    const contactName = contact.data("contact-name");
    const contactEmail = contact.data("contact-email");
    const selectInput = $("#client-select-name");

    $("#link-client-head").text(`Clients linked to ${contactName}`);

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
            $('#linked-client').modal('show');
            updateClientsTableCC(contactEmail);
        }
    });
}

const updateClientsTableCC = (email) => {
    $("#client-modal-list-loading").removeClass("hidden");
    $("#linked-clients-table").addClass("hidden");
    $("#client-modal-list-error").addClass("hidden");
    
    const tbody = $("#linked-clients-table tbody");
    const nameFilter= $("#filter-contact-modal-table").val().trim();

    tbody.empty();

    $.ajax({
        url: `/api/contacts/${email}/clients`,
        method: "GET",
        data: {name: nameFilter},
        success: function(response) {
            const clients = response.clients;

            if (clients.length == 0) {
                $("#client-modal-list-error")
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
                                    <button class="btn btn-secondary w-100">Unlink</button>
                                <a>
                            </td>
                        </tr>
                    `);
                });

                $("#linked-clients-table").removeClass("hidden");
            }
        },
        error: function(xhr, status, error) {
            $("#client-modal-list-error").text("Failed to fetch clients, " + error).removeClass("hidden");
        },
        complete: function() {
            $("#client-modal-list-loading").addClass("hidden");
        }
    });
}

const unlinkClients = (button) => {
    let link = button.attr("href");

    $.ajax({
        url: link,
        type: "DELETE",
        success: function(response) {
            openClientsTabCC(currentContact);
        },
        error: function(xhr, status, error) {
            alert("Error unlinking client");
        }
    });
}

$(function() {
    updateContactTableCC();
    
    $("#existing-contacts-table").on("click", "button", function() {
        currentContact = $(this);
        openClientsTabCC($(this));
    });

    $("#linked-clients-table").on("click", "a", function(event) {
        event.preventDefault();
        unlinkClients($(this));
        updateContactTableCC();
    });

    $("#general-tab").on("shown.bs.tab", function(event) {
        updateContactTableCC();
    });

    $("#filter-contact-table").on("input", function(event){
        updateContactTableCC();
    });

    $("#filter-contact-modal-table").on("input", function(event){
        updateClientsTableCC(currentContact.data("contact-email"));
    });
});