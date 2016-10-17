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
    
    $(".dropdown-choice").click(function() {
        var idArr = $(this).attr("id").split("-")

        if (idArr.length !== 4)
            return alert("Misformed subject identification");
        
        var sceneIdx = idArr[1];
        var subjectIdx = idArr[3];
        
        createSubjectMaker(null, sceneIdx, subjectIdx)();
    });
    
    $(".remove-subject").click(function() {
        var idArr = $(this).attr("id").split("-");
        
        if (idArr.length != 5)
            return alert("Misformed subject identification");
        
        var sceneIdx = idArr[1];
        var subjectIdx = idArr[3];
        removeSubject(sceneIdx, subjectIdx);
    });
});

function refresh(data) {
    window.location = window.location.href;
}

function createSubjectMaker(gender, sceneIdx, subjectIdx) {
    return function(name) {
        $.post(window.location.href,
            {   action: "new subject",
                name: $("#new-subject-name-" + sceneIdx).val(),
                gender: gender,
                sceneIdx: sceneIdx,
                subjectIdx: subjectIdx
            },
            refresh);
    }
}

function removeSubject(sceneIdx, subjectIdx) {
    $.post(window.location.href,
    {
        action: "remove subject",
        sceneIdx: sceneIdx,
        subjectIdx: subjectIdx
    },
    refresh);
}