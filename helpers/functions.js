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