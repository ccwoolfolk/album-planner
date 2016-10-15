"use strict";

exports.sceneDetails = function(subjects, scenes) {

    // Convert a scene object to an array of subjects
    let convertIds = (idArray) => {

        return idArray.subjects.map( (val) => {
            
            let subjectMatch = subjects.find((subject) => {
                return parseInt(subject["subject_id"]) === parseInt(val);
            });
            
            return { name: subjectMatch.name, gender: subjectMatch.gender }
        });

    };

    return scenes.map(convertIds);
}

    // TODO = test and move to helpers?
exports.findEventIndex = function(eventId, events) {
    for (let i = 0; i < events.length; i++) {
        if (events[i]["event_id"] == eventId)
            return i;
    }
    
    return null;
}