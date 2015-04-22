"use strict";
var repository = require('../repositories/newsRepository');
var _ = require('underscore');
var factories = require('./factories');

module.exports.getNewsArticle = function getNewsArticle(req, res, next) {
    repository.findById(req.params.articleId, function (err, data) {
        if (err) {
            next(err);
        } else if (!data) {
            err = new Error("Not found");
            err.status = 404;
            next(err);
        } else {
            res.render('news', factories.toNewsViewModel(data));
        }
    });
};

module.exports.getCreateNewsArticle = function getCreateNewsArticle(req, res) {
    res.render('create');
};

module.exports.getEditNewsArticle = function getEditNewsArticle(req, res, next) {
    repository.findById(req.params.articleId, function (err, data) {
        if (err) {
            next(err);
        } else if (!data) {
            err = new Error("Not found");
            err.status = 404;
            next(err);
        } else {
            res.render('create', factories.toNewsViewModel(data));
        }
    });
};

module.exports.putNewsArticle = function putNewsArticle(req, res, next) {
    var model = factories.createModel(req);
    repository.addOrReplace(model, function(err) {
        if (err) {
            next(err);
        } else {
            res.set('Location', factories.generateHref(model));
            res.json(model);
            res.status(201);
        }
    });
};

module.exports.listNewsArticles = function listNewsArticles(req, res, next) {
    var numArticles = req.query.count || 0;
    repository.listCurrentArticles(function (err, data) {
        if (err) {
            next(err);
        } else {
            res.json(_.chain(data).sortBy('date').last(numArticles).map(factories.toNewsListResource).value());
            res.status(200);
        }
    });
};
