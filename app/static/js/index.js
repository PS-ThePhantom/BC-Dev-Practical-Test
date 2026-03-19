$(function() {
    $('.carousel').carousel('pause');

    $("#client-area-btn").on("click", "button", function() {
        $('.carousel').carousel('0');
    });

    $("#contact-area-btn").on("click", "button", function() {
        $('.carousel').carousel('1');
    });
});