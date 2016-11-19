"use strict";

// Thanks to https://www.terlici.com/2014/09/15/node-testing.html

let MongoClient = require("mongodb").MongoClient;
let async = require("async");

let state = {
    db: null,
    mode: null
}

const PRODUCTION_URI = process.env.MONGODB_URI || "mongodb://" + process.env.IP + ":" + "27017/production";
const TEST_URI = process.env.MONGODB_URI || "mongodb://" + process.env.IP + ":" + "27017/test";

exports.MODE_TEST = "mode_test";
exports.MODE_PRODUCTION = "mode_production";

exports.connect = function(mode, done) {
    if (state.db)
        return done();
    
    let uri = mode === exports.MODE_TEST ? TEST_URI : PRODUCTION_URI;
    
    MongoClient.connect(uri, function(err, db) {
        console.log("Connecting to the database at: ", uri);
        if (err)
            return done(err);
        state.db = db;
        state.mode = mode;
        done();
    });
}

exports.getDB = function() {
    return state.db;
}

exports.drop = function(done) {
    if (!state.db)
        return done();
    
    // This is faster then dropping the database
    state.db.collections(function(err, collections) {
        if (err)
            console.error(err);
            
        async.each(collections, function(collection, cb) {
            if (collection.collectionName.indexOf('system') === 0) {
                return cb();
            }
            collection.remove(cb);
        }, done);
    });
}

exports.fixtures = function(data, done) {
    let db = state.db;
  
    if (!db)
        return done(new Error('Missing database connection.'));

    let names = Object.keys(data.collections);
    
    async.each(names, function(name, cb) {
        db.createCollection(name, function(err, collection) {
            if (err)
                return cb(err)
            collection.insert(data.collections[name], cb);
        });
    }, done);
}
