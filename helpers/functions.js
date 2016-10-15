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

exports.findEventIndex = function(eventId, events) {
    for (let i = 0; i < events.length; i++) {
        if (events[i]["event_id"] == eventId)
            return i;
    }
    
    return null;
}


exports.subjectIsNew = function(subject, existingSubjects) {
    let existingIds = existingSubjects.map((val) => { return val["subject_id"] });
    return existingIds.indexOf(subject["subject_id"]) === -1;
}