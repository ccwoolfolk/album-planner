"use strict";
let assert = require("assert");
let fixtures = require(process.env.GOPATH + '/test/fixtures/model-albums').data;

const helpers = require(process.env.GOPATH + '/helpers/functions.js');


describe('Helper Function Tests', function() {
   it("sceneDetails()", function(done) {
    
        let subjects = [ {  "subject_id": "1",
                            "name": "oscar",
                            "gender": "male"    },
                                
                        {   "subject_id": 2,
                            "name": "rylee",
                            "gender": "female"  } ];
                            
        let scenes =    [ { "subjects": [1,"2"]   },
                          { "subjects": ["2"]     },
                          { "subjects": [1]     } ];
       
        let expected =  [ [ { name: "oscar", gender: "male"   },
                            { name: "rylee", gender: "female" } ],
                          [ { name: "rylee", gender: "female" } ],
                          [ { name: "oscar", gender: "male"   } ]
                        ];
        assert(helpers.sceneDetails(subjects, scenes), expected);
        done();
   });
   
    it("findEventIndex()", function(done) {
        assert.equal(helpers.findEventIndex(3, fixtures.collections.users[0].events), 1);
        done();
    });
});