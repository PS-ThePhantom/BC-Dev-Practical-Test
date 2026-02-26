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
            clients.forEach(client => {
                tbody.append(`
                    <tr>
                        <td class="text-start">${client.name}</td>
                        <td class="text-start">${client.client_code}</td>
                        <td class="text-center">${client.no_of_contacts}</td>
                    </tr>
                `);
            });

            if (clients.length == 0) {
                $("#client-list-error").text("No client(s) found.").removeClass("hidden");
            } else {
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

$(function() {
    updateClientTable();
});