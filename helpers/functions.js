"use strict";

/**
 * Helper functions
 * @module helpers/functions
 */

/**
 * Convert an array of subject IDs to an array of subject objects
 *
 * @param {Object[]} subjects - Array of subject objects
 * @param {string} subjects[].subject_id - Subject ID
 * @param {string} subjects[].name - Name of subject
 * @param {string} subjects[].gender - Gender of subject
 * 
 * @param {Object[]} scenes - Array of scene objects
 * @param {string[]} scenes[].subjects - Array of subject IDs
 * 
 * @returns {Object[][]} Array for each scene containing an array of objects with name and gender
 * 
 */
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

/**
 * Find a specific event within an event array
 * 
 * @param {string} eventId
 * @param {Object[]} Array of event objects with event_id keys
 * @param {string} events[].event_id
 * @returns {integer} Zero-based index
 * 
 */
exports.findEventIndex = function(eventId, events) {
    for (let i = 0; i < events.length; i++) {
        if (events[i]["event_id"] == eventId)
            return i;
    }
    
    return null;
}


/**
 * Check if a subject_id is already present in an array of subjects
 * 
 * @param {Object} subject
 * @param {string} subject.subject_id
 * @param {Object[]} existingSubjects
 * @param {string} existingSubjects[].subject_id
 * 
 * @returns {boolean}
 * 
 */
exports.subjectIsNew = function(subject, existingSubjects) {
    let existingIds = existingSubjects.map((val) => { return val["subject_id"] });
    return existingIds.indexOf(subject["subject_id"]) === -1;
}

/**
 * Convert a date from the model to a standardized format
 * 
 * @param {string} dateInput - String the can be parsed by new Date()
 * 
 * @returns {string} String of form "month-date-4DigitYear"
 * 
 */
exports.formatDate = function(dateInput) {
    let date = new Date(dateInput);
    
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let y = date.getFullYear();
    
    return [m, d, y].join("-");
};