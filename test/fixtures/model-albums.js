exports.data = {
    "collections": {
        "users": [
            {
                "user_id": "1",
                "user_name": "Test Person",
                "provider": "facebook",
                "login_id": "10101068906050962",
                "events": [
                    {
                        "event_id": 1,
                        "name": "birthday party",
                        "date": (new Date("October 7, 2016")).valueOf(),
                        "subjects": [
                            {   "subject_id": 1,
                                "name": "oscar",
                                "gender": "male"    },
                                
                            {   "subject_id": 2,
                                "name": "rylee",
                                "gender": "female"  }
                        ],
                        "scenes": [
                            {   "subjects": [1,2]   },
                            {   "subjects": [2]     },
                            {   "subjects": [1]     }
                        ]
                    }, {
                        "event_id": 3,
                        "name": "second event",
                        "date": (new Date("October 7, 2016")).valueOf(),
                        "subjects": [],
                        "scenes": []
                    }
                ]
            }
        ]
    }
}