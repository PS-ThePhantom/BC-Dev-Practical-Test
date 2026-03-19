let currentClient = null;

$("#client-form").submit(function(event) {
    event.preventDefault();
    if ($("#client-name").val() > 100) {
        alert("name too long, max = 100 character");
        return;
    }

    $("#client-submit-button").prop("disabled", true);
    $("#client-submit-button>div").removeClass("hidden");
    $("#client-submit-button>span").addClass("hidden");

    $.ajax({
        url: "/api/clients",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            name: $("#client-name").val()
        }),
        success: function(response) {
            $("#client-name").val("");
            $("#client-code").val(response.client_code);
            $("#client-create-success")
                .text(response.message)
                .removeClass("text-danger")
                .addClass("text-success");

            updateClientTableCA();
        },
        error: function(xhr, status, error) {
            $("#client-create-success")
                .text(error)
                .removeClass("text-success")
                .addClass("text-danger");
        },
        complete: function() {
            $("#client-submit-button>div").addClass("hidden");
            $("#client-submit-button>span").removeClass("hidden");
            $("#client-submit-button").prop("disabled", false);
            $("#client-create-success").removeClass("hidden");
        }
    });
});

$("#contacts-form").submit(function(event) {
    event.preventDefault();
    $("#contact-submit-button").prop("disabled", true);
    $("#contact-submit-button>div").removeClass("hidden");
    $("#contact-submit-button>span").addClass("hidden");

    const clientCode = currentClient.data("client-code");
    const contact_email = $("#contact-select-name").val();

    $.ajax({
        url: `/api/clients/${clientCode}/contacts/${contact_email}`,
        method: "POST",
        contentType: "application/json",
        success: function(response) {
            $("#contact-select-name").val("");
            $("#contact-link-success")
                .text(response.message)
                .removeClass("text-danger")
                .addClass("text-success");

            updateContactsTableCA(clientCode);
            updateClientTableCA();
        },
        error: function(xhr, status, error) {
            $("#contact-link-success")
                .text(error)
                .removeClass("text-success")
                .addClass("text-danger");
        },
        complete: function() {
            $("#contact-submit-button>div").addClass("hidden");
            $("#contact-submit-button>span").removeClass("hidden");
            $("#contact-submit-button").prop("disabled", false);
            $("#contact-link-success").removeClass("hidden");

            openContactsTabCA(currentClient);
        }
    });
});

const updateClientTableCA = () => {
    $("#client-list-loading").removeClass("hidden");
    $("#existing-clients-table").addClass("hidden");
    $("#client-list-error").addClass("hidden");
    
    const tbody = $("#existing-clients-table tbody");
    const nameFilter = $("#filter-client-table").val().trim();

    tbody.empty();

    $.ajax({
        url: "/api/clients",
        method: "GET",
        data: { name: nameFilter },
        success: function(response) {
            const clients = response.clients;

            if (clients.length == 0) {
                $("#client-list-error")
                    .text("No client(s) found.")
                    .removeClass("hidden");
            } else {
                clients.forEach(client => {
                    tbody.append(`
                        <tr>
                            <td class="text-start">${client.name}</td>
                            <td class="text-start">${client.client_code}</td>
                            <td class="text-center">${client.no_of_contacts}</td>
                            <td><button class="btn btn-secondary w-100" data-client-code="${client.client_code}" data-client-name="${client.name}" data-toggle="modal" data-target="#linked-contact">View/Link</button></td>
                        </tr>
                    `);
                });

                $("#existing-clients-table").removeClass("hidden");
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

const updateContactsTableCA = (client_code) => {
    $("#contact-modal-list-loading").removeClass("hidden");
    $("#linked-contacts-table").addClass("hidden");
    $("#contact-modal-list-error").addClass("hidden");
    
    const tbody = $("#linked-contacts-table tbody");
    const nameFilter= $("#filter-client-modal-table").val().trim();
    
    tbody.empty();

    $.ajax({
        url: `/api/clients/${client_code}/contacts`,
        method: "GET",
        data: { name: nameFilter },
        success: function(response) {
            const contacts = response.contacts;

            if (contacts.length == 0) {
                $("#contact-modal-list-error")
                    .text("No contacts found.")
                    .removeClass("hidden");
            } else {
                contacts.forEach(contact => {
                    tbody.append(`
                        <tr>
                            <td class="text-start">${contact.surname} ${contact.name}</td>
                            <td class="text-start">${contact.email}</td>
                            <td class="text-start">
                                <a href="api/clients/${client_code}/contacts/${contact.email}">
                                    <button class="btn btn-secondary w-100">Unlink</button>
                                <a>
                            </td>
                        </tr>
                    `);
                });

                $("#linked-contacts-table").removeClass("hidden");
            }
        },
        error: function(xhr, status, error) {
            $("#contact-modal-list-error").text("Failed to fetch contacts, " + error).removeClass("hidden");
        },
        complete: function() {
            $("#contact-modal-list-loading").addClass("hidden");
        }
    });
}

const openContactsTabCA = (client) => {
    const clientCode = client.data("client-code");
    const clientName = client.data("client-name");
    const selectInput = $("#contact-select-name");
    const filterContacts = $("#filter-client-modal-table");

    $("#link-contact-head").text(`Contacts linked to ${clientCode}`);

    selectInput.empty();
    filterContacts.val('');


    $.ajax({
        url: `/api/clients/${clientCode}/contacts/unlinked`,
        method: "GET",
        success: function(response) {
            const contacts = response.contacts;

            if (contacts.length == 0) {
                selectInput.append(`
                    <option value="" selected disabled hidden>No contacts found</option>
                `);
            } else {
                selectInput.append(`
                    <option value="" selected disabled hidden>Select a contact</option>
                `);
                contacts.forEach(contact => {
                    selectInput.append(`
                        <option value="${contact.email}">${contact.surname} ${contact.name}</option>
                    `);
                });
            }
        },
        error: function(xhr, status, error) {
            $("#client-create-success")
                .text("cannot fetch clients list, error:" + error)
                .removeClass("text-success")
                .addClass("text-danger");
        },
        complete: function() {
            $('#linked-contact').modal('show');
            updateContactsTableCA(clientCode);
        }
    });
}

const unlinkContactsCA = (button) => {
    let link = button.attr("href");

    $.ajax({
        url: link,
        type: "DELETE",
        success: function(response) {
            openContactsTabCA(currentClient);
        },
        error: function(xhr, status, error) {
            alert("Error unlinking contact");
        }
    });
}

$(function() {
    updateClientTableCA();

    $("#existing-clients-table").on("click", "button", function() {
        currentClient = $(this);
        openContactsTabCA($(this));
    });

    $("#linked-contacts-table").on("click", "a", function(event) {
        event.preventDefault();
        unlinkContactsCA($(this));
        updateClientTableCA();
    });

    $("#general-tab").on("shown.bs.tab", function(event) {
        updateClientTableCA();
    });

    $("#filter-client-table").on("input", function(event){
        updateClientTableCA();
    });

    $("#filter-client-modal-table").on("input", function(event){
        updateContactsTableCA(currentClient.data("client-code"));
    });
});