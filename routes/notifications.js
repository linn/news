"use strict";
var repository = require('../repositories/newsRepository');
var _ = require('underscore');
var factories = require('./factories');

module.exports.get = function generateNotifications(req, res, next) {
    repository.listCurrentArticles(function (err, data) {
        if (err) {
            next(err);
        } else {
            res.json(_.chain(data).sortBy('date').last(5).map(factories.toNewsListResource).value());
            res.status(200);
        }
    });
};