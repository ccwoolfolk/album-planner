"use strict";

/** @module controllers/routes */

const nodemailer = require("nodemailer");

const helpers = require('../helpers/functions.js');
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
    
    let renderData = req.isAuthenticated() ?  {
        userId: req.user.id,
        name: req.user.name,
    } : {};
    
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
        
        // Pair complete status with detailed subject list in single array of objects
        details["scenes_detailed"] = details["scenes_detailed"].map(function(val, idx) {
            return {
                complete: details.scenes[idx].complete,
                subjects: val
            }
        });
        
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
 * Toggle completion status for a scene
 * 
 */
exports.postToggleSceneComplete = function(req, res, next) {
    if (req.body.action == "toggle complete") {
        model.toggleSceneComplete(req.user.id, req.params.eventId,
        req.body.sceneIdx, createEventCallback());
    }
    
    next();
}

/**
 * Remove a scene permanently
 * 
 */
exports.postRemoveScene = function(req, res, next) {
    if (req.body.action == "remove scene") {
        model.removeScene(req.user.id, req.params.eventId,
            req.body.sceneIdx, createEventCallback());
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


/**
 * Render contact page
 * 
 */
exports.getContact = function(req, res) {
    let renderData = req.isAuthenticated() ?  {
        userId: req.user.id,
        name: req.user.name,
    } : {};
    
    res.render("contact", renderData);
};


/**
 * Return a function that sends a contact form message
 * 
 * @param {string[]} emailCredentials
 * @param {string} emailCredentials[0] - gmail account name
 * @param {string} emailCredentials[1] - gmail account password
 * 
 * @returns {function} Routing function for POST operations on contact page
 * 
 */
exports.createPostContact = function(emailCredentials) {
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: emailCredentials[0] + "@gmail.com",
            pass: emailCredentials[1]
        }
    });
    
    return function(req, res) {
        if (req.body.message === "" || !req.body.email.match(/[a-z0-9]+@.+\./gi)) {
            res.statusCode = 500;
            res.send();
        } else {
            let mailOptions = {
                from: "contact-form@album-planner.com",
                to: "ccwoolfolk@gmail.com",
                subject: "Album Planner Contact Form",
                text: JSON.stringify({
                    name: req.body.name,
                    email: req.body.email,
                    message: req.body.message
                })
            };
            
            transporter.sendMail(mailOptions, function(err, info) {
                if(err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.send();
                } else {
                    console.log('Message sent: ' + info.response);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({result: "Success!"}));
                };
            });
        }
    }
};