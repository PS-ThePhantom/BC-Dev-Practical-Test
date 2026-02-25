$("#client-form").submit(function(event) {
    event.preventDefault();
    $("#client-submit-button").prop("disabled", true);
    $("#client-submit-button>div").removeClass("hidden");
    $("#client-submit-button>span").addClass("hidden");

    //submit form data to server
    $.ajax({
        url: "/api/client",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            name: $("#client-name").val()
        }),
        success: function(response) {
            $("#client-name").val("");
            $("#client-create-success").text(response.message).removeClass("text-danger").addClass("text-success");
        },
        error: function(xhr, status, error) {
            $("#client-create-success").text(error).removeClass("text-success").addClass("text-danger");
        }
    });
    
    $("#client-submit-button>div").addClass("hidden");
    $("#client-submit-button>span").removeClass("hidden");
    $("#client-submit-button").prop("disabled", false);
    $("#client-create-success").removeClass("hidden");
});