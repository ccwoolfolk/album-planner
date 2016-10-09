"use strict";
let assert = require("assert")
  , DB = require('../db')
  , fixtures = require(process.env.GOPATH + '/test/fixtures/model-albums').data;
  
let Album = require(process.env.GOPATH + '/models/event');

const user_id = 1;

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
            done();                             // Are these necessary?
        });
    });
    
    it("getEvents()", function(done) {
        Album.getEvents(user_id, function(err, results) {
            assert.equal(results.length, 1);
            assert.equal(results[0].name, "birthday party");
            done();
        });
    });
    
    it("addEvent() single addition", function(done) {
        // Take user_id, name, date
        Album.addEvent(user_id, "retirement party", "January 15, 2017", function(err, id) {

            Album.getEvents(user_id, function(err, results) {
                if (err) assert(false);
                
                assert.equal(results.length, 2);
                assert.equal(results[0].name, "birthday party");
                assert.equal(results[1].name, "retirement party");
                assert.equal(results[1]["event_id"], 2);
                
                Album.addEvent(user_id, "third event", "January 15, 2017", function(err, id) {
                    Album.getEvents(user_id, function(err, results) {
                        assert.equal(results.length, 3);
                        assert.equal(results[2]["event_id"], 3);
                        done();
                    });
                });
                
            });
        });
        
    
                
        
    });


});

