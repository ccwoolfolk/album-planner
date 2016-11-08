"use strict";

/** @module controllers/routes */

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
exports.home = function (req, res) {
    
    let renderData = {};
    if (req.isAuthenticated()) {
        renderData.userId = req.user.id;
        renderData.name = req.user.name;
    }
    
    res.render("index", renderData);

};