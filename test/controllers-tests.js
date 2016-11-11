"use strict";

let DB = require('../db')
  , fixtures = require(process.env.GOPATH + '/test/fixtures/model-albums').data;
let assert = require("assert");
const route = require(process.env.GOPATH + '/controllers/routes.js');


let createReq = function(auth) {
    return {
        isAuthenticated: () => auth,
        user: {
            id: "1",
            name: "Test Person"
        }
    }
};





describe("Route tests", function() {

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



   it("getHome()", function(done) {
       
       let req = createReq(true);
       
       // With authentication
       let renderResults = {
           userId: "",
           name: ""
       };
       
       let res = {
           render: (fileName, data) => { renderResults = data }
       };
       
       route.getHome(req, res)
       assert.equal(renderResults.userId, req.user.id);
       assert.equal(renderResults.name, req.user.name);
       
       // Without authentication
       req = createReq(false);
       renderResults = {
           userId: "",
           name: ""
       };
       
       route.getHome(req, res);
       assert.equal(renderResults.userId, undefined);
       assert.equal(renderResults.name, undefined);
       
       done();
   });
   
   it("getEvents()", function(done) {
       let req = createReq(true)
       
       let renderResults = {};
       
       let res = {
           render: (fileName, data) => { 
               
               assert.equal(fileName, "events");
               assert.equal(data.userId, "1");
               assert.equal(data.name, "Test Person");
               assert.equal(data.events.length, 2);
               done();
           }
       };
       
       route.getEvents(req, res)
       
   });
   
   it("getLogout()");
});