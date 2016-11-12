"use strict";

const express = require("express");
const pug = require("pug");
const bodyParser = require("body-parser");
const passport = require("passport");

const model = require("./models/event.js");
const helpers = require(process.env.GOPATH + '/helpers/functions.js');
const route = require("./controllers/routes.js");

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




app.get('/', route.getHome);
app.get('/logout', route.getLogout);



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


/* Show the user's events when provided a user ID */
app.get("/events", ensureAuthenticated, route.getEvents);

/* Add a new event */
app.post("/events", ensureAuthenticated, route.postEvents);

/* Show the event details when provided a user ID and event ID */
app.get("/events/:eventId", ensureAuthenticated, route.getEventDetails);


app.post("/events/:eventId", ensureAuthenticated, route.postNewScene, 
    route.postAddSubject, route.postRemoveSubject, route.postUpdateEventName,
    (req, res) => {
        res.redirect("/events/" + req.params.eventId);
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