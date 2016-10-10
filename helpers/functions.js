"use strict";

exports.sceneDetails = function(subjects, scenes) {
    
    // Convert a scene object to an array of subjects
    let convertIds = (idArray) => {
        console.log("idArray:", idArray)
        idArray.subjects.map( (val) => {
            let subjectMatch = subjects.find((subject) => subject["subject_id"] === val);
            return { name: subjectMatch.name, gender: subjectMatch.gender }
        });
    };
    
    return scenes.map(convertIds);
}