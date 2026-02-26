$("#client-form").submit(function(event) {
    event.preventDefault();
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

            updateClientTable();
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

    const clientCode = $(this).data("client-code");
    const contact_email = $("#contact-name").val();

    $.ajax({
        url: `/api/clients/${contactCode}/contacts/${contact_email}`,
        method: "POST",
        contentType: "application/json",
        success: function(response) {
            $("#contact-name").val("");
            $("#contact-link-success")
                .text(response.message)
                .removeClass("text-danger")
                .addClass("text-success");

            updateContactTable();
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
            $("#contact-create-success").removeClass("hidden");

            openContactsTab();
        }
    });
});

const updateClientTable = () => {
    $("#client-list-loading").removeClass("hidden");
    $("#existing-clients-table").addClass("hidden");
    $("#client-list-error").addClass("hidden");
    
    const tbody = $("#existing-clients-table tbody");
    tbody.empty();

    $.ajax({
        url: "/api/clients",
        method: "GET",
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
                            <td><button class="btn btn-secondary w-100" data-client-code="${client.client_code}" data-client-name="${client.name}">View/Link</button></td>
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

const upDateContactsTable = (client_code) => {
    $("#contact-list-loading").removeClass("hidden");
    $("#linked-contacts-table").addClass("hidden");
    $("#contact-list-error").addClass("hidden");
    
    const tbody = $("#linked-contacts-table tbody");
    tbody.empty();

    $.ajax({
        url: `/api/clients/${client_code}/contacts`,
        method: "GET",
        success: function(response) {
            const contacts = response.contacts;

            if (contacts.length == 0) {
                $("#contact-list-error")
                    .text("No contacts found.")
                    .removeClass("hidden");
            } else {
                contacts.forEach(contact => {
                    tbody.append(`
                        <tr>
                            <td class="text-start">${contact.name} ${contact.surname}</td>
                            <td class="text-start">${contact.email}</td>
                            <td class="text-start">
                                <a href="/clients/${client_code}/contacts/${contact.email}">
                                    ${window.location.origin}/clients/${client_code}/contacts/${contact.email}
                                <a>
                            </td>
                        </tr>
                    `);
                });

                $("#linked-contacts-table").removeClass("hidden");
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

const openContactsTab = (client) => {
    const clientCode = client.data("client-code");
    const clientName = client.data("client-name");
    const contactsTab = new bootstrap.Tab($("#contacts-tab"));
    const selectInput = $("#contact-name");

    $("#link-contact-head").text(`Link a contact to ${clientName} (${clientCode})`);
    $("#linked-contacts-head").text(`Contacts linked to ${clientName} (${clientCode})`);

    selectInput.empty();

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
            contactsTab.show();
            upDateContactsTable(clientCode);
        }
    });
}

const unlinkContacts = (button) => {
    let link = button.attr("href");

    $.ajax({
        url: link,
        type: "DELETE",
        success: function(response) {
            openContactsTab();
        },
        error: function(xhr, status, error) {
            alert("Error unlinking contact");
        }
    });
}

$(function() {
    updateClientTable();

    $("#existing-clients-table").on("click", "button", function() {
        openContactsTab($(this));
    });

    $("linked-contacts-table").on("click", "a", function(event) {
        event.preventDefault();
        unlinkContacts($(this));
    });
});