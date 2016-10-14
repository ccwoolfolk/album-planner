$("document").ready(function() {
    console.log("loaded")
    $("#submit-new-scene").click(function() {
        console.log("clicked")

        $.post(window.location.href,
            {action: "new scene"},
            (data) => window.location = window.location.href);
            
    });
});