"use strict";

const express = require("express");
const pug = require("pug");
const bodyParser = require("body-parser");
const passport = require("passport");

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





var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: "1791667527746166",
    clientSecret: "ed3f7bd8a346109958a8a9f03798d548",
    callbackURL: "http://album-planner-ccwoolfolk.c9users.io/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      //console.log("Profile:", profile);
      return model.getUserId(profile.provider, profile.id, (err, userId) => {
          let userInfo = {
              id: userId,
              name: profile.displayName
          }
          return done(err, userInfo);
      });
    //return done(null, profile);
  }
));


// Express and Passport Session
var session = require('express-session');
app.use(session({secret: "mycustomsessionsecretxyzabc"}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  // placeholder for custom user serialization
  // null is for errors
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  // placeholder for custom user deserialization.
  // maybe you are going to get the user from mongo by id?
  // null is for errors
  done(null, user);
});



// main menu route
app.get('/', function (req, res) {
    
    let renderData = {};
    if (req.isAuthenticated()) {
        renderData.userId = req.user.id;
        renderData.name = req.user.name;
    }
    
    res.render("index", renderData);

});


app.get('/logout', function(req, res){
  console.log('logging out');
  req.logout();
  res.redirect('/');
});

// we will call this to start the Facebook Login process
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will call this URL
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);


// Simple middleware to ensure user is authenticated.
// Use this middleware on any resource that needs to be protected.
// If the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next(); }

  // denied. redirect to login
  res.redirect('/')
}

app.get('/protected', ensureAuthenticated, function(req, res) {
  res.json(req);
});








/* Show the user's events when provided a user ID */
app.get("/events", ensureAuthenticated, (req, res) => model.getEvents(req.user.id, (err, events) => {
    if (err) 
        console.error(err);

    res.render("events", {userId: req.user.id, name: req.user.name, events: events});
    
}));

/* Add a new event */
app.post("/events", ensureAuthenticated, (req, res) => {
    let newDate = new Date();
    model.addEvent(
        req.user.id,
        req.body.eventName,
        newDate.toString(),
        (err, id) => {
            if (err)
                console.error(err);
            res.redirect("/events");
        });
});

/* Show the event details when provided a user ID and event ID */
app.get("/events/:eventId", ensureAuthenticated, (req, res) => {
    
    model.getEventDetails(req.user.id, req.params.eventId, (err, details) => {
        if (err)
            console.error(err)

        details["scenes_detailed"] = helpers.sceneDetails(details.subjects, details.scenes);
        res.render("event-details", {
            userId: req.user.id,
            name: req.user.name,
            details: details});
    });
});


app.post("/events/:eventId", ensureAuthenticated, (req, res) => {
    let action = req.body.action;
    let userId = req.user.id;
    let eventId = req.params.eventId;
    let cb = (err, result) => res.redirect("/events/" + eventId);

    if (action === "new scene")
        model.addScene(userId, eventId, cb);

    else if (action === "new subject") {
        let subjectIdx = req.body.subjectIdx;
        let newSubject = {};
        
        if (subjectIdx !== undefined)
            newSubject.subjectIdx = subjectIdx;
            
        else 
            newSubject = {
                name: req.body.name === "" ? "?" : req.body.name,
                gender: req.body.gender
            }
        
        model.addSubject(userId, eventId, req.body.sceneIdx, newSubject, cb);

    } else if (action == "remove subject") {
        
        let sceneIdx = req.body.sceneIdx;
        let subjectIdx = req.body.subjectIdx;
        
        model.removeSubject(userId, eventId, sceneIdx, subjectIdx, cb);        
    } else if (action == "edit name") {
        model.updateEventName(req.body.name, userId, eventId, cb);
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