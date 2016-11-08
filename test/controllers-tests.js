"use strict";

let assert = require("assert");
const route = require(process.env.GOPATH + '/controllers/routes.js');

describe("Route tests", function() {
   it("home() with authentication", function(done) {
       
       let req = {
           isAuthenticated: () => true,
           user: {
               id: "1234",
               name: "Test Person"
           }
       };
       
       // With authentication
       let renderResults = {
           userId: "",
           name: ""
       };
       
       let res = {
           render: (fileName, data) => { renderResults = data }
       };
       
       route.home(req, res)
       assert.equal(renderResults.userId, req.user.id);
       assert.equal(renderResults.name, req.user.name);
       
       // Without authentication
       req.isAuthenticated = () => false;
       renderResults = {
           userId: "",
           name: ""
       };
       
       route.home(req, res);
       assert.equal(renderResults.userId, undefined);
       assert.equal(renderResults.name, undefined);
       
       done();
   });
});