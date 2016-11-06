"use strict";
/** @module models/event */

// Thanks to https://www.terlici.com/2014/09/15/node-testing.html

let DB = require('../db');
const helpers = require(process.env.GOPATH + '/helpers/functions.js');

const COLLECTION = 'users';

/**
 * User object for adding new users
 * 
 * @constructor
 * @param {Object} params
 * @param {string} params.user_name - User display name; "Bobby Tables"
 * @param {string} params.provider - Authorization provider; e.g., "facebook"
 * @param {string} login_id - ID provided by authorization provider
 * 
 * @returns {Object} User object
 */
let User = exports.User = function(params) {
    ["user_name", "provider", "login_id"].forEach((val) => {
        if (!params.hasOwnProperty(val))
            throw new Error("User object lacks '" + val + "' key");
    });
    
    return {
        "user_name": params.user_name,
        "provider": params.provider,
        "login_id": params.login_id,
        "events": []
    }
};

/**
 * Add user to the database
 * 
 * @param {Object} newUser - Object of class @see module:models/event~User
 * @param {function} cb
 * 
 */
let addUser = exports.addUser = function(newUser, cb) {
    let db = DB.getDB();
    db.collection(COLLECTION).find({},{_id: 0, user_id: 1}).toArray(function(err, results) {
        if (err) {
            console.error(err);
            return cb(err, null);
        }
        
        let idArr = results.map((val) => {return parseInt(val.user_id)});
        newUser.user_id = (Math.max.apply(null, idArr) + 1).toString();
        db.collection(COLLECTION).insert(newUser, cb);
    });
};


/**
 * Get all users in one object
 * 
 * @param {function} cb
 * @returns cb(err, string_results)
 * 
 */
// Get all users
exports.all = function(cb) {
  let db = DB.getDB();
  db.collection(COLLECTION).find({}).toArray((err, results) => {
    cb(err, results)
  });
}

// Get all events for a given user
let getEvents = function(user_id, cb) {
    let db = DB.getDB();
    db.collection(COLLECTION).find({"user_id": user_id}).toArray(function(err, results) {
        if (err) return cb(err);
        let events = results.length === 0 ? [] : results[0].events;
        cb(err, events);
    });
}

exports.getEvents = getEvents;


// Take user_id, name, date
exports.addEvent = function(userId, eventName, eventDate, cb) {
    let db = DB.getDB();
    getEvents(userId, function(err, allEvents) {

        let newId = allEvents.reduce((prev, curr) => {
          return Math.max(prev, parseInt(curr["event_id"]));
        }, 0);
        
        newId++;

        let result = db.collection(COLLECTION).update(
            {"user_id": userId}, 
            {$push: {
                events: {
                    "event_id": newId,
                    "name": eventName,
                    "date": eventDate,
                    "subjects": [],
                    "scenes": []
                }
            }},
        (err, res) => cb(err,res));
    });
};

exports.removeEvent = function(userId, eventId, cb) {
    let db = DB.getDB();
    db.collection(COLLECTION).update(
        {"user_id": userId},
        {$pull: {
            events: { "event_id": eventId }
        }},
        (err, res) => cb(err, res));
}

let getEventDetails = function(userId, eventId, cb) {
    let db = DB.getDB();
    db.collection(COLLECTION).find({
        "user_id": userId,
        "events": {
            "$elemMatch": {
                "event_id": parseInt(eventId)
            }
        }
    }, {
        "_id": 0,
        "events.$": 1
    }).toArray(function(err, results) {
        if (err) {
            console.error(err);
            return cb(err);
        }
        let output = results[0].events[0];
        cb(err, output);
    })
}

exports.getEventDetails = getEventDetails;

exports.addScene = function(userId, eventId, cb) {
    let db = DB.getDB();

    getEvents(userId, function(err, events) {
        let idx = helpers.findEventIndex(eventId, events);

        let updateQuery = {};
        updateQuery["events." + idx + ".scenes"] = {subjects: []}

        db.collection(COLLECTION).update(
            {"user_id": userId}, 
            {$push: updateQuery},
        (err, res) => cb(err,res));    
    });
}

exports.removeSubject = function(userId, eventId, sceneIdx, subjectIdx, cb) {
    let db = DB.getDB();
    sceneIdx = parseInt(sceneIdx);
    
    getEvents(userId, function(err, events) {
        let idx = helpers.findEventIndex(eventId, events);
        let newSubjectArr = events[idx].scenes[sceneIdx].subjects.slice();
        newSubjectArr.splice(subjectIdx, 1);
        
        let updateQuery = {}
        updateQuery["events." + idx + ".scenes." + sceneIdx + ".subjects"] = newSubjectArr;
        
        db.collection(COLLECTION).update(
            {"user_id": userId},
            {$set: updateQuery},
            (err, res) => cb(err, res)  );
            
    });
}


exports.updateEventName = function(newName, userId, eventId, cb) {
    let db = DB.getDB();
    
    getEvents(userId, function(err, events) {
        let idx = helpers.findEventIndex(eventId, events);
        let updateQuery = {}
        updateQuery["events." + idx + ".name"] = newName;
        
        db.collection(COLLECTION).update(
            {"user_id": userId},
            {$set: updateQuery},
            (err, res) => cb(err, res)  );
    });
}


exports.addSubject = function(userId, eventId, sceneIdx, newSubject, cb) {
    let db = DB.getDB();
    sceneIdx = parseInt(sceneIdx);
    
    getEvents(userId, function(err, events) {
        let idx = helpers.findEventIndex(eventId, events);
        
        // Generate subject_id if not adding an existing subject or use an existing subject
        if (newSubject.hasOwnProperty("subjectIdx")) {
            newSubject = events[idx].subjects[newSubject.subjectIdx];
        } else {
            let newId = 1 + events[idx].subjects.map((val) => val["subject_id"]).reduce((prev, curr) => Math.max(prev, curr), 0);
            newSubject["subject_id"] = newId;
        }
        
        // Stop if subject is already in scene
        if (events[idx].scenes[sceneIdx].subjects.indexOf(newSubject["subject_id"]) !== -1)
            return cb(err, null);
        
        let updateQuery = {};
        updateQuery["events." + idx + ".scenes." + sceneIdx + ".subjects"] = newSubject["subject_id"];
        db.collection(COLLECTION).update(
            {"user_id": userId},
            {$push: updateQuery},
            (err, res) => {
                if (helpers.subjectIsNew(newSubject, events[idx].subjects)) {
                
                    // Add to subject list
                    let updateQuery = {};
                    updateQuery["events." + idx + ".subjects"] = newSubject;
                    
                    db.collection(COLLECTION).update(
                        {"user_id": userId},
                        {$push: updateQuery},
                        (err, res) => cb(err, res));
                } else cb(err, res);
            });
    });
}

let getUserId = function(provider, loginId, cb) {
    let db = DB.getDB();
    
    db.collection(COLLECTION).find({
        provider: provider,
        login_id: loginId
    }, {
        "_id": 0,
        "user_id": 1
    }).toArray(function(err, results) {
        if (results.length > 1)
            return cb(new Error("Found multiple users with this authentication info"), null);
        
        if (results.length === 0)
            return addUser(new User({
                "user_name": "",
                "provider": provider,
                "login_id": loginId
            }), function() {
                console.log("Adding", loginId, "from", provider);
                return getUserId(provider, loginId, cb);
            });
            
        cb(err, results[0]["user_id"]);
    });
}

exports.getUserId = getUserId;