"use strict";
/** @module models/event */

// Thanks to https://www.terlici.com/2014/09/15/node-testing.html

let DB = require('../db');
const helpers = require('../helpers/functions.js');

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


let addUser =
/**
 * Add user to the database
 * 
 * @param {Object} newUser - Object of class @see module:models/event~User
 * @param {function} cb
 * 
 */
exports.addUser = function(newUser, cb) {
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
exports.all = function(cb) {
  let db = DB.getDB();
  db.collection(COLLECTION).find({}).toArray((err, results) => {
    cb(err, results)
  });
};


let getEvents =
/**
 * Get all events for a given user
 * 
 * @param {string} user_id - User ID
 * @param {function} cb - Callback function
 * 
 * @returns Calls callback with (err, events) where events is an array of events
 * 
 */
exports.getEvents = function(user_id, cb) {
    let db = DB.getDB();
    db.collection(COLLECTION).find({"user_id": user_id}).toArray(function(err, results) {
        if (err) return cb(err);
        let events = results.length === 0 ? [] : results[0].events;
        cb(err, events);
    });
};


/**
 * Add event to a given user profile
 * 
 * @param {string} userId - User ID
 * @param {string} eventName - Event display name
 * @param {string} eventDate - Event display date
 * @param {function} cb - Callback function
 * 
 * @returns Calls callback with (err, results) where results is output of update
 * 
 */
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


/**
 * Remove an event from a given user profile
 * 
 * @param {string} userId - User ID
 * @param {integer} eventId - Event ID
 * @param {function} cb - Callback function
 * 
 * @returns Calls callback function (err, results) with results from update
 * 
 */
exports.removeEvent = function(userId, eventId, cb) {
    let db = DB.getDB();
    db.collection(COLLECTION).update(
        {"user_id": userId},
        {$pull: {
            events: { "event_id": eventId }
        }},
        (err, res) => cb(err, res));
}


let getEventDetails =
/**
 * Find a single event object and pass to the callback function
 * 
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {function} cb - Callback function that takes (error, eventObject)
 * 
 * @returns Calls callback function
 * 
 */
exports.getEventDetails = function(userId, eventId, cb) {
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
};


/**
 * Add an empty scene to an event
 * 
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {function} cb - Callback function
 * 
 * @returns Calls callback function with (err, results) from update
 * 
 */
exports.addScene = function(userId, eventId, cb) {
    let db = DB.getDB();

    getEvents(userId, function(err, events) {
        if (err) {
            console.error(err);
            return cb(err, null);
        }
        
        let idx = helpers.findEventIndex(eventId, events);

        let updateQuery = {};
        updateQuery["events." + idx + ".scenes"] = {
            subjects: [],
            complete: false
        };

        db.collection(COLLECTION).update(
            {"user_id": userId}, 
            {$push: updateQuery},
        (err, res) => cb(err,res));    
    });
};


/**
 * Remove a scene from an event
 * 
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {integer} sceneIdx - Scene index within scene array
 * @param {function} cb - Callback function
 * 
 */
exports.removeScene = function(userId, eventId, sceneIdx, cb) {
    let db = DB.getDB();
    sceneIdx = parseInt(sceneIdx);
    
    getEvents(userId, function(err, events) {
        let idx = helpers.findEventIndex(eventId, events);

        let updateQuery = {}
        let scenes = events[idx].scenes.slice();
        scenes.splice(sceneIdx, 1);
        updateQuery["events." + idx + ".scenes"] = scenes;
        
        db.collection(COLLECTION).update(
            {"user_id": userId},
            {$set: updateQuery},
            (err, res) => cb(err, res)  );
            
    });
};


/**
 * Remove subject from a scene
 * 
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {integer} sceneIdx - Scene index within scene array
 * @param {integer} subjectIdx - Subject index within subject array
 * @param {function} cb - Callback function
 * 
 * @returns Calls callback with (err, results) from update
 * 
 */
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
};


/**
 * Change a scene completion status (false->true or true->false)
 * 
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {integer} sceneIdx - Scene index within scene array
 * @param {function} cb - Callback function
 * 
 */
exports.toggleSceneComplete = function(userId, eventId, sceneIdx, cb) {
    let db = DB.getDB();

    getEvents(userId, function(err, events) {
        if (err) {
            console.error(err);
            return cb(err, null);
        }
        
        let idx = helpers.findEventIndex(eventId, events);
        let key = "events." + idx + ".scenes." + sceneIdx + ".complete";
        let currentCompletion = events[idx].scenes[sceneIdx].complete;
        
        let updateQuery = {};
        updateQuery[key] = !currentCompletion;

        db.collection(COLLECTION).update(
            {"user_id": userId}, 
            {$set: updateQuery},
        (err, res) => cb(err,res));    
    });
};

/**
 * Updates event name
 * 
 * @param {string} newName - New name to change to
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {function} cb - Callback function
 * 
 * @returns Calls callback with (err, results) from update
 * 
 */
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
};


/**
 * Add subject to a scene
 * 
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {integer} sceneIdx - Scene index within scene array
 * @param {Object} newSubject - Subject to add
 * @param {function} cb - Callback function
 * 
 * @returns Null if subject is already in scene. Else, calls callback function
 * 
 */
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
};


let getUserId =
/**
 * Retrieve user ID during login
 * 
 * @param {string} provider - E.g. 'facebook'
 * @param {string} loginId - Login ID from authentication provider
 * @param {function} cb - Callback function
 * 
 * @returns cb(error, user ID); adds user if not present in database
 * 
 */
exports.getUserId = function(provider, loginId, cb) {
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
};