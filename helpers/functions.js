"use strict";

/**
 * Convert an array of subject IDs to an array of subject objects
 * @param {Object[]} subjects - Array of subject objects
 * @param {string} subjects[].subject_id - Subject ID
 * @param {string} subjects[].name - Name of subject
 * @param {string} subjects[].gender - Gender of subject
 * 
 * @param {Object[]} scenes - Array of scene objects
 * @param {string[]} scenes[].subjects - Array of subject IDs
 * 
 * @returns {Object[][]} Array for each scene containing an array of objects with name and gender
 */
function sceneDetails(subjects, scenes) {

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

exports.sceneDetails = sceneDetails;

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