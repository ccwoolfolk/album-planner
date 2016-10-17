"use strict";
let assert = require("assert")
  , DB = require('../db')
  , fixtures = require(process.env.GOPATH + '/test/fixtures/model-albums').data;
  
let Album = require(process.env.GOPATH + '/models/event');

const user_id = "1";

describe('Model Event Tests', function() {

    before(function(done) {
        DB.connect(DB.MODE_TEST, done);
        
    });

    beforeEach(function(done) {
        DB.drop(function(err) {
            if (err)
                return done(err);
                
            DB.fixtures(fixtures, done)
        });
        
        
    });

    it('all', function(done) {
        Album.all(function(err, comments) {
            assert.equal(comments.length, 1);
            done();
        });
    });
    
    it("getEvents()", function(done) {
        Album.getEvents(user_id, function(err, results) {
            assert.equal(results.length, 2);
            assert.equal(results[0].name, "birthday party");
            done();
        });
    });
    
    it("addEvent()", function(done) {
        // Take user_id, name, date
        Album.addEvent(user_id, "retirement party", "January 15, 2017", function(err, id) {

            Album.getEvents(user_id, function(err, results) {
                if (err) assert(false);
                
                assert.equal(results.length, 3);
                assert.equal(results[0].name, "birthday party");
                assert.equal(results[2].name, "retirement party");
                assert.equal(results[2]["event_id"], 4);
                
                Album.addEvent(user_id, "additional event", "January 15, 2017", function(err, id) {
                    Album.getEvents(user_id, function(err, results) {
                        assert.equal(results.length, 4);
                        assert.equal(results[3]["event_id"], 5);
                        done();
                    });
                });
                
            });
        });
    });
    
    it("removeEvent()", function(done) {
        Album.removeEvent(user_id, 1, function(err, results) {
            Album.getEvents(user_id, function(err, results) {
                assert.equal(results.length, 1);
                assert.equal(results[0]["event_id"], 3);
                assert.equal(results[0].name, "second event");
                done();
            });
        });
    });

    it("getEventDetails() first entry", function(done) {
        let eventId = "1";
        Album.getEventDetails(user_id, eventId, function(err, eventDetails) {
            assert.equal(eventDetails.name, "birthday party");
            assert.equal(eventDetails.subjects.length, 2);
            assert.equal(eventDetails.scenes.length, 3);
            done();
        });
    });
    
    it("getEventDetails() not first entry", function(done) {
        let eventId = "3";
        Album.getEventDetails(user_id, eventId, function(err, eventDetails) {
            assert.equal(eventDetails.name, "second event");
            assert.equal(eventDetails.subjects.length, 0);
            assert.equal(eventDetails.scenes.length, 0);
            done();
        });
    });
    
    it("addScene()", function(done) {
        Album.addScene(user_id, 1, function(err, result) {
            Album.getEventDetails(user_id, 1, function(err, eventDetails) {
                assert.equal(eventDetails.scenes.length, 4);
                
                assert.deepEqual(eventDetails.scenes[3].subjects, [])
                done();
            });

        });
    });
    
    
    it("addSubject() with existing subject", function(done) {
        let eventId = 1;
        let sceneIdx = 1;
        let newSubject = {
            subjectIdx: 0
        }
        
        Album.addSubject(user_id, eventId, sceneIdx, newSubject, function() {
            Album.getEventDetails(user_id, eventId, function(err, eventDetails) {
                
                // Scene updated
                assert.deepEqual(eventDetails.scenes[sceneIdx].subjects, [2, 1]);
                
                // Subject list not updated
                assert.equal(eventDetails.subjects.length, 2);
                
                done();
            });
        });
    });
    
    it("addSubject()", function(done) {
        let eventId = 1;
        let sceneIdx = 1;
        let newSubject = {
            "name": "casey",
            "gender": "male"
        }
        
        // Add new subject
        Album.addSubject(user_id, eventId, sceneIdx, newSubject, function() {
            Album.getEventDetails(user_id, eventId, function(err, eventDetails) {

                // Scene updated
                assert.deepEqual(eventDetails.scenes[sceneIdx].subjects, [2, 3]);
                
                // Subject list updated
                assert.equal(eventDetails.subjects.length, 3);
                assert.equal(eventDetails.subjects[2].name, "casey");
                assert.equal(eventDetails.subjects[2]["subject_id"], 3);
                
                // Add existing subject
                Album.addSubject(user_id, eventId, sceneIdx, {
                    "subjectIdx": 1 }, function() {
                        
                        Album.getEventDetails(user_id, eventId, function(err, eventDetails) {
                            assert.deepEqual(eventDetails.scenes[sceneIdx].subjects, [2, 3]);
                            assert.equal(eventDetails.subjects.length, 3);
                            
                            done();
                        });
                });
            });
        });
    });
    
    it("removeSubject()", function(done) {
        let eventId = 1;
        let sceneIdx = 0;
        let subjectIdx = 1;
        
        Album.removeSubject(user_id, eventId, sceneIdx, subjectIdx, function() {
            Album.getEventDetails(user_id, eventId, function(err, eventDetails) {
                console.log("testing removeSubject")
                console.log(eventDetails.scenes[sceneIdx].subjects.length == 1)

                assert(eventDetails.scenes[sceneIdx].subjects.length == 1)
                assert.equal(eventDetails.scenes[sceneIdx].subjects.length, 1);
                assert.deepEqual(eventDetails.scenes[sceneIdx].subjects, [1]);
                done();
            })
        })
    })
    
    /*
    it("updateEventName()", function(done) {
       assert(false);
       done();
    });
    
    */
    
});

