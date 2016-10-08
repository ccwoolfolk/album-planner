"use strict";

// Thanks to https://www.terlici.com/2014/09/15/node-testing.html

let DB = require('../db');

const COLLECTION = 'albums';

// Get all events for a user
exports.all = function(cb) {
  let db = DB.getDB();
  db.collection(COLLECTION).find({user_id: "test"}).toArray(cb);
}

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