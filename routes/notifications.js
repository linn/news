"use strict";
var repository = require('../repositories/newsRepository');
var _ = require('underscore');
var factories = require('./factories');

var notificationsMediaType = 'application/vnd.linn.notifications+json; version=1';

function negotiate(req, res, data, statusCode) {
    if (req.header('Accept') === 'application/json' || req.accepts(notificationsMediaType) === notificationsMediaType) {
        res.set('Content-Type', notificationsMediaType);
        res.json(factories.toNotificationsResource(data));
        res.status(statusCode);
    } else {
        res.sendStatus(406);
    }
}

module.exports.get = function generateNotifications(req, res, next) {
    repository.listCurrentArticles(function (err, data) {
        if (err) {
            next(err);
        } else {
            negotiate(req, res, _.chain(data).sortBy('date').last(5).value(), 200);
        }
    });
};