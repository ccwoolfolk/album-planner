"use strict";

const express = require("express");
const pug = require("pug");

const model = require("./models/event.js");
const helpers = require(process.env.GOPATH + '/helpers/functions.js');

const fixtures = require('./test/fixtures/model-albums').data;

const app = express();
const DB = require("./db.js");

// Add middleware
app.set("view engine", "pug");
app.set("json spaces", 3);

app.use(express.static("public"));

/* Show the user's events when provided a user ID */
app.get("/:userId", (req, res) => model.getEvents(req.params.userId, (err, events) => {
    if (err) 
        console.error(err);

    res.render("events", {userId: req.params.userId, events: events});
    
}));



/* Show the event details when provided a user ID and event ID */
app.get("/:userId/events/:eventId", (req, res) => {
    
    model.getEventDetails(req.params.userId, req.params.eventId, (err, details) => {
        if (err)
            console.error(err)

        details["scenes_detailed"] = helpers.sceneDetails(details.subjects, details.scenes);
        res.render("event-details", {details: details});
    });
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