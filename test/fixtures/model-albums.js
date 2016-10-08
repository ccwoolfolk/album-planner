exports.data = {
    "collections": {
        "albums": [
            {
                "user_id": 1,
                "user_name": "Test Person",
                "events": [
                    {
                        "event_id": 1,
                        "name": "birthday party",
                        "date": (new Date("October 7, 2016")).toString(),
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
                    }
                ]
            }
        ]
    }
}