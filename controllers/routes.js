"use strict";

/** @module controllers/routes */

const model = require("../models/event.js");

exports.home = {};
exports.events = {};

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