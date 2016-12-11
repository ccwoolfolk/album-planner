$("document").ready(function() {
    // Tracks warning dialogue boxes related to deleting scene
    // Prevents creating two warnings for the same scene
    var openWarnings = {};
    
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
    
    $("#btn-edit-date").click(function() {
        $("#input-date-edit").datepicker();
        $("#name-container").css("display", "none");
        $("#date-edit-container").show("fast");
        $("#btn-submit-date").click(function() {
            
            let newDate = $("#input-date-edit").datepicker("getDate").toDateString();
            if (newDate === "")
                return;
                
            let request = $.ajax({
                url: window.location.href,
                method: "PUT",
                data: { date: newDate },
                success: refresh
            });
            
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
    
    $(".remove-scene").click(function() {
        var idArr = $(this).attr("id").split("-");
        var sceneIdx = idArr[1];
        if (openWarnings[sceneIdx]) {
            $(this).parent().next().html("");
            delete openWarnings[sceneIdx];
        } else {
            $(this).parent().next().html('<div class="alert alert-warning" role="alert"><strong>WARNING!</strong> This will permanently delete your scene! Click <a id="confirm-remove-' + sceneIdx + '" class="alert-link">here</a> if you are sure, or click the close button to cancel.</div>');
            openWarnings[sceneIdx] = true;
            $("#confirm-remove-"+sceneIdx).click(function() {
                removeScene(sceneIdx);
            });
        }
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

function removeScene(sceneIdx) {
    $.post(window.location.href,
    {
        action: "remove scene",
        sceneIdx: sceneIdx
    },
    refresh);
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