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
    
    it("User()", function(done) {
       let testUser = new Album.User({
           "user_name": "Testy McTestface",
           "provider": "facebook",
           "login_id": "12345"
       });
       
       assert.equal(testUser.user_name, "Testy McTestface");
       assert.equal(testUser.provider, "facebook");
       assert.equal(testUser.login_id, "12345");
       assert(testUser.hasOwnProperty("events"));
       assert.equal(testUser.events.length, 0);
       
       assert.throws(() => {return new Album.User({wrong_key: 123})});
       done();
    });
    
    it("addUser()", function(done) {
        
        let newUser = new Album.User({
            "user_name": "Alf",
            "provider": "alfco",
            "login_id": "10"
        });
        
        Album.addUser(newUser, function(err, results) {
            
            Album.all(function(err, users) {
                assert.equal(users.length, 2);
                assert.equal(users[1].user_name, "Alf");
                assert(users[1].hasOwnProperty("user_id"));
                assert(users[1].user_id, "2");
                done();
            });
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
                assert.equal(eventDetails.scenes[3].complete, false);
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
                assert(eventDetails.scenes[sceneIdx].subjects.length == 1)
                assert.equal(eventDetails.scenes[sceneIdx].subjects.length, 1);
                assert.deepEqual(eventDetails.scenes[sceneIdx].subjects, [1]);
                done();
            });
        });
    });

    it("toggleSceneComplete()", function(done) {
        let eventId = 1;
        let sceneIdx = 1;
        
        Album.toggleSceneComplete(user_id, eventId, sceneIdx, function() {
            Album.getEventDetails(user_id, eventId, function(err, eventDetails) {
                assert.equal(eventDetails.scenes[sceneIdx].complete, false);
                done();
            });
        });
    });

    it("removeScene()", function(done) {
        let eventId = 1;
        let sceneIdx = 1;
       
        Album.removeScene(user_id, eventId, sceneIdx, function() {
            Album.getEventDetails(user_id, eventId, function(err, eventDetails) {
                assert.equal(eventDetails.scenes[0].subjects.length, 2);
                assert.equal(eventDetails.scenes[1].subjects.length, 1);
                assert.equal(eventDetails.scenes.length, 2);
                done();
            });
       });
    });

    it("updateEventName()", function(done) {
        let newEventName = "new birthday event"
        let eventId = 1;
        
        Album.updateEventName(newEventName, user_id, eventId, function() {
            Album.getEventDetails(user_id, eventId, function(err, eventDetails) {
                assert.equal(eventDetails.name, newEventName);
                done();
            });
        });
    });
    
    it("getUserId() with existing user", function(done) {
       let provider = "facebook";
       let loginId = "10101068906050962";
       
       Album.getUserId(provider, loginId, function(err, userId) {
           assert.equal(userId, "1");
           done();
       });
       
    });
    
    it("getUserId() with new user", function(done) {
        let provider = "facebook";
        let loginId = "somethingfake";
        
        Album.getUserId(provider, loginId, function(err, userId) {
            assert.equal(userId, "2");
            done();
        });
    });
    
});

