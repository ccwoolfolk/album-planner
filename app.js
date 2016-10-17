"use strict";

const express = require("express");
const pug = require("pug");
const bodyParser = require('body-parser');

const model = require("./models/event.js");
const helpers = require(process.env.GOPATH + '/helpers/functions.js');

const fixtures = require('./test/fixtures/model-albums').data;

const app = express();
const DB = require("./db.js");

// Add middleware
app.set("view engine", "pug");
app.set("json spaces", 3);


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static("public"));
app.use(function(req, res, next) {
   if(req.url.substr(-1) == '/' && req.url.length > 1)
       res.redirect(301, req.url.slice(0, -1));
   else
       next();
});

/* Show the user's events when provided a user ID */
app.get("/:userId", (req, res) => model.getEvents(req.params.userId, (err, events) => {
    if (err) 
        console.error(err);

    res.render("events", {userId: req.params.userId, events: events});
    
}));

/* Add a new event */
app.post("/:userId", (req, res) => {
    let newDate = new Date();
    model.addEvent(
        req.params.userId,
        req.body.eventName,
        newDate.toString(),
        (err, id) => {
            if (err)
                console.error(err);
            res.redirect(req.params.userId);
        });
});

/* Show the event details when provided a user ID and event ID */
app.get("/:userId/events/:eventId", (req, res) => {
    
    model.getEventDetails(req.params.userId, req.params.eventId, (err, details) => {
        if (err)
            console.error(err)

        details["scenes_detailed"] = helpers.sceneDetails(details.subjects, details.scenes);
        res.render("event-details", {details: details});
    });
});

app.delete("/:userId/events/:eventId", (req, res) => {

});

app.post("/:userId/events/:eventId", (req, res) => {
    let action = req.body.action;
    let userId = req.params.userId;
    let eventId = req.params.eventId;
    let cb = (err, result) => res.redirect("/" + userId + "/events/" + eventId);
    

    if (action === "new scene")
        model.addScene(userId, eventId, cb);

    else if (action === "new subject") {
        let subjectIdx = req.body.subjectIdx;
        let newSubject = {};
        
        if (subjectIdx !== undefined)
            newSubject.subjectIdx = subjectIdx;
            
        else 
            newSubject = {
                name: req.body.name,
                gender: req.body.gender
            }
        
        model.addSubject(userId, eventId, req.body.sceneIdx, newSubject, cb);

    } else if (action == "remove subject") {
        
        let sceneIdx = req.body.sceneIdx;
        let subjectIdx = req.body.subjectIdx;
        
        model.removeSubject(userId, eventId, sceneIdx, subjectIdx, cb);        
    }
    
});
    

/* testing only */
app.get("/test/:id", (req, res) => model.all((err, events) => {
    if (err) 
        console.error(err);
    console.log(events);
    res.json(events);
    
}));


DB.connect(DB.MODE_TEST, () => DB.drop(() => DB.fixtures(fixtures, () => {
    app.listen(8080, () => console.log("listening on 8080") );
})));