"use strict";
let assert = require("assert");
  
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
});