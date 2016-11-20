$("document").ready(function() {
    
    $("#btn-edit-name").click(function() {
        
        $("#name-container").css("display", "none");
        $("#name-edit-container").show("fast");
        $("#btn-submit-name").click(function() {
            $.post(window.location.href,
                {action: "edit name",
                 name: $("#input-name-edit").val()},
                 refresh);
        });
    });
    
    $("#submit-new-scene").click(function() {

        $.post(window.location.href,
            {action: "new scene"},
            refresh);
            
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
    
    $(".toggle-complete").click(function() {
        var idArr = $(this).attr("id").split("-");
        toggleComplete(idArr[1]);
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

function toggleComplete(sceneIdx) {
    $.post(window.location.href,
    {
        action: "toggle complete",
        sceneIdx: sceneIdx
    },
    refresh);
}