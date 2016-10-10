"use strict";

// Thanks to https://www.terlici.com/2014/09/15/node-testing.html

let DB = require('../db');

const COLLECTION = 'users';

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

exports.getEventDetails = function(userId, eventId, cb) {
    let db = DB.getDB();
    db.collection(COLLECTION).find({
        "user_id": userId,
        "events.event_id": parseInt(eventId)
    }, {
        "_id": 0,
        "events": 1
    }).toArray(function(err, results) {
        if (err) {
            console.error(err);
            return cb(err);
        }
        let output = results[0].events[0];
        cb(err, output);
    })
}