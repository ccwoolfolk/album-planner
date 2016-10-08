"use strict";
let assert = require("assert")
//  , should = require('should')
  , DB = require('../db')
  , fixtures = require(process.env.GOPATH + '/test/fixtures/model-albums');
let Event = require(process.env.GOPATH + '/models/event');


describe("description", function() {
    it("should return true", function() {
        assert(false);
    });
});



/*


describe('Model Comment Tests', function() {

  before(function(done) {
    DB.connect(DB.MODE_TEST, done)
  })

  beforeEach(function(done) {
    DB.drop(function(err) {
      if (err) return done(err)
      DB.fixtures(fixtures, done)
    })
  })

  it('all', function(done) {
    Comment.all(function(err, comments) {
      comments.length.should.eql(3)
      done()
    })
  })

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
})

*/