"use strict";

/** @module controllers/routes */

const helpers = require(process.env.GOPATH + '/helpers/functions.js');
const model = require("../models/event.js");


/**
 * Render the homepage
 * 
 * @param {Object} req
 * @param {function} req.isAuthenticated
 * @param {Object} req.user
 * @param {string} req.user.id
 * @param {string} req.user.name
 * @param {Object} res
 * 
 */
exports.getHome = function (req, res) {
    
    let renderData = {};
    if (req.isAuthenticated()) {
        renderData.userId = req.user.id;
        renderData.name = req.user.name;
    }
    
    res.render("index", renderData);

};

/**
 * Render the events page
 * 
 * @param {Object} req
 * @param {function} req.isAuthenticated
 * @param {Object} req.user
 * @param {string} req.user.id
 * @param {string} req.user.name
 * @param {Object} res
 * 
 */
exports.getEvents = function(req, res) {
    model.getEvents(req.user.id, function(err, events) {
        if (err)
            console.error(err);

        res.render("events", {userId: req.user.id, name: req.user.name, events: events});
    });
};

/**
 * Log out a user and redirect home
 * 
 * @param {Object} req
 * @param {function} req.logout
 * @param {Object} res
 * 
 */
exports.getLogout = function(req, res) {
    console.log('logging out user ID "' + req.user.id + '"');
    req.logout();
    res.redirect('/');
};

/**
 * Create a new event
 * 
 * @param {Object} req
 * @param {string} req.user.id
 * @param {string} req.body.eventName
 * @param {Object} res
 * 
 */
exports.postEvents = function(req, res) {
    let newDate = new Date();
    model.addEvent(
        req.user.id,
        req.body.eventName,
        newDate.valueOf(),
        (err, id) => {
            if (err)
                console.error(err);
            res.redirect("/events");
        });
};


let getEventDetails =
/**
 * Get a specific event
 * 
 * @param {Object} req
 * @param {string} req.user.id
 * @param {string} req.params.eventId
 * @param {Object} res
 * @param {function} res.render
 * 
 */
exports.getEventDetails = function(req, res) {
    model.getEventDetails(req.user.id, req.params.eventId, (err, details) => {
        if (err)
            console.error(err)

        details["scenes_detailed"] = helpers.sceneDetails(details.subjects, details.scenes);
        res.render("event-details", {
            userId: req.user.id,
            name: req.user.name,
            details: details});
    });
};


/**
 * Create function to redirect to event details following an action
 * 
 * @param {Object} req
 * @param {Object} res
 * 
 * @returns {function} Function with (err, results) inputs
 *
 */
let createEventCallback = function() {
    return function(err, result) {
        if (err)
            console.error(err);
        //res.redirect("/events/" + req.params.eventId);
    }
};

/**
 * Create a new scene within an event
 * 
 */
exports.postNewScene = function(req, res, next) {

    if (req.body.action === "new scene")
        model.addScene(req.user.id, req.params.eventId, 
                createEventCallback());

        next();

};

/**
 * Add a subject to a scene
 * 
 */
exports.postAddSubject = function(req, res, next) {
    if (req.body.action === "new subject") {
        let subjectIdx = req.body.subjectIdx;
        let newSubject = {};
        
        if (subjectIdx !== undefined)
            newSubject.subjectIdx = subjectIdx;
            
        else 
            newSubject = {
                name: req.body.name === "" ? "?" : req.body.name,
                gender: req.body.gender
            }
        
        model.addSubject(req.user.id, req.params.eventId, req.body.sceneIdx, 
                newSubject, createEventCallback());

    }
    
    next();

};

/**
 * Remove a subject from a scene
 * 
 */
exports.postRemoveSubject = function(req, res, next) {
    if (req.body.action == "remove subject") {
        
        let sceneIdx = req.body.sceneIdx;
        let subjectIdx = req.body.subjectIdx;
        
        model.removeSubject(req.user.id, req.params.eventId, req.body.sceneIdx,
                req.body.subjectIdx, createEventCallback());
    }
    
    next();

};

/**
 * Update an event name
 * 
 */
exports.postUpdateEventName = function(req, res, next) {
    if (req.body.action == "edit name")
        model.updateEventName(req.body.name, req.user.id, req.params.eventId, 
                createEventCallback());

    next();
    
};