$("document").ready(function() {
    
    var validate = function() {

        if (!$("#inputEmail").val().match(/[a-z0-9]+@.+\./gi))
            return "Invalid email input";
            
        if ($("#inputMessage").val() === "")
            return "Please provide a message before sending!"
        
        return false;

    };
    
    $("#submit").click(function() {
        var msg = validate();
        
        if (msg)
            $("#message").text(msg);
        else 
            $.post(window.location.href, {
                name: $("#inputName").val(),
                email: $("#inputEmail").val(),
                message: $("#inputMessage").val()
            }, function() {
                $("#message").text("Sent!");
            }).fail(function() {
                $("#message").text("Error sending message. Unable to complete");
            });
    });
});