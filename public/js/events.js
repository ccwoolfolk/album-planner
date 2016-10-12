$("document").ready(function() {
    $("#submit-new-event").click(function() {
        let eventName = $("#new-event-name").val();
        if (eventName === "")
            alert("Please provide an event name!");
        else
            $.post(window.location.href,
                {eventName: eventName},
                (data) => window.location = window.location.href);
            
    });
});