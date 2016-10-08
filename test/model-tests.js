"use strict";
let assert = require("assert")
  , should = require('should')
  , DB = require('../db')
  , fixtures = require(process.env.GOPATH + '/test/fixtures/model-albums').data;
  
let Album = require(process.env.GOPATH + '/models/event');


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
            console.log("All test, comments: ", comments);
            comments.length.should.eql(1);
            done();                             // Are these necessary?
        });
    });
    
    it("getEvents()", function(done) {
        let user_id = 1;
        Album.getEvents(user_id, function(err, results) {
            results.length.should.eql(1);
            results[0].name.should.eql("birthday party");
            //console.log("getEvents: ", results);
            done();
        });
    });
    
    it("addEvent()", function(done) {
        // Take name, date and return event_id
        let user_id = 1;
        Album.addEvent("retirement party", "January 15, 2017", function(err, id) {
            Album.getEvents(user_id, function(err, results) {
                results.length.should.eql(2);
                results[1]._id.should.eql(id);
                results[0].name.should.eql("birthday party");
                results[1].name.should.eql("retirement party");
                done();
            });
        });
    });

/*
  it('create', function(done) {
    Comment.create('Famous Person', 'I am so famous!', function(err, id) {
      Comment.all(function(err, comments) {
        comments.length.should.eql(4)
        comments[3]._id.should.eql(id)
        comments[3].user.should.eql('Famous Person')
        comments[3].text.should.eql('I am so famous!')
        done()
      })
    })
  })

  it('remove', function(done) {
    Comment.all(function(err, comments) {
      Comment.remove(comments[0]._id, function(err) {
        Comment.all(function(err, result) {
          result.length.should.eql(2)
          result[0]._id.should.not.eql(comments[0]._id)
          result[1]._id.should.not.eql(comments[0]._id)
          done()
        })
      })
    })
  })


*/

});

