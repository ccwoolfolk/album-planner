"use strict";

// Thanks to https://www.terlici.com/2014/09/15/node-testing.html

let DB = require('../db');

const COLLECTION = 'users';

// Get all users
exports.all = function(cb) {
  let db = DB.getDB();
  db.collection(COLLECTION).find({}).toArray(function(err, results) {
      console.log(results);
      cb(err, results);
  });
}

// Get all events for a given user
exports.getEvents = function(user_id, cb) {
    let db = DB.getDB();
    db.collection(COLLECTION).find({"user_id": user_id}).toArray(function(err, results) {
        if (err) return cb(err);
        let events = results.length === 0 ? [] : results[0].events;
        cb(err, events);
    });
}


// Take user_id, name, date
exports.addEvent = function(userId, eventName, eventDate, cb) {
    let db = DB.getDB();
    let result = db.collection(COLLECTION).update(
        {"user_id": userId}, 
        {$push: {
            events: {
                "event_id": null,
                "name": eventName,
                "date": eventDate,
                "subjects": [],
                "scenes": []
            }
        }},
    (err, res) => cb(err,res));

};


/*

// Create new comment and return its id
exports.create = function(user, text, cb) {
  db = DB.getDB()
  db.collection(COLLECTION).insert({user: user, text: text}, function(err, docs) {
    if (err) return cb(err)
    cb(null, docs[0]._id)
  })
}

// Remove a comment
exports.remove = function(id, cb) {
  db = DB.getDB()
  db.collection(COLLECTION).remove({_id:id}, function(err, result) {
    cb(err)
  })
}

*/