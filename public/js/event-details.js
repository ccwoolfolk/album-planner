$("document").ready(function() {
    
    $("#submit-new-scene").click(function() {
        console.log("clicked")

        $.post(window.location.href,
            {action: "new scene"},
            (data) => window.location = window.location.href);
            
    });
    
    ["female", "male"].forEach(function(gender) {
        $(".add-" + gender).click(function() {
            var sceneIdx = $(this).attr("id").replace("scene-", "");
            createSubjectMaker(gender, sceneIdx)()
        });
    });
    
});

function createSubjectMaker(gender, sceneIdx) {
    return function(name) {
        $.post(window.location.href,
            {   action: "new subject",
                name: $("#new-subject-name-" + sceneIdx).val(),
                gender: gender,
                sceneIdx: sceneIdx},
            (data) => window.location = window.location.href);
    }
}