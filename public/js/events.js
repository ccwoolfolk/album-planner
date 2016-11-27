$("document").ready(function() {
    // Tracks warning dialogue boxes related to deleting scene
    // Prevents creating two warnings for the same scene
    let openWarnings = {};

    $("#submit-new-event").click(function() {
        let eventName = $("#new-event-name").val();
        if (eventName === "")
            alert("Please provide an event name!");
        else
            $.post(window.location.href,
                {eventName: eventName},
                (data) => window.location = window.location.href);
            
    });
    
    $(".remove-event").click(function() {
        let eventId = $(this).attr("id").split("-")[2];

        if (openWarnings[eventId]) {
            $(this).next().next().html("");
            delete openWarnings[eventId];
        } else {
            $(this).next().next().html('<div class="alert alert-warning" role="alert"><strong>WARNING!</strong> This will permanently delete your event! Click <a id="confirm-remove-' + eventId + '" class="alert-link">here</a> if you are sure, or click the close button to cancel.</div>');
            openWarnings[eventId] = true;
            $("#confirm-remove-"+eventId).click(function() {
                removeEvent(eventId);
            });
        }
    });
    
});

function removeEvent(id) {
    $.ajax({
        url: window.location.href,
        type: "DELETE",
        data: {
            eventId: id
        },
        success: () => {window.location = window.location.href}
    });
}