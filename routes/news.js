"use strict";
var repository = require('../repositories/newsRepository');
var _ = require('underscore');
var factories = require('./factories');

var newsMediaType = 'application/vnd.linn.news+json; version=1';
var newsLabelsMediaType = 'application/vnd.linn.news-labels+json; version=1';

function negotiate(req, res, data, statusCode) {
    if (req.header('Accept') === 'application/json' || req.accepts(newsMediaType) === newsMediaType) {
        res.set('Content-Type', newsMediaType);
        res.json(factories.toNewsListResource(data));
        res.status(statusCode);
    } else {
        res.sendStatus(406);
    }
}

module.exports.getNewsArticle = function getNewsArticle(req, res, next) {
    repository.findBy(req.params.articleId, function (err, data) {
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
    repository.findBy(req.params.articleId, function (err, data) {
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

module.exports.removeNewsArticle = function removeNewsArticle(req, res, next) {
    repository.removeBy(req.params.articleId, function (err, data) {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
};

module.exports.putNewsArticle = function putNewsArticle(req, res, next) {
    var model;
    try {
        model = factories.createModel(req);
    } catch (err) {
        err.status = 400;
        next(err);
    }
    repository.addOrReplace(model, function(err) {
        if (err) {
            next(err);
        } else {
            res.set('Location', factories.generateHref(model));
            res.set('Content-Type', newsMediaType);
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
            negotiate(req, res, _.chain(data).sortBy('date').last(numArticles).reverse().value(), 200);
        }
    });
};

module.exports.listLabels = function listLabels(req, res, next) {
    repository.listLabels(function (err, data) {
        if (err) {
            next(err);
        } else {
            res.set('Content-Type', newsLabelsMediaType);
            res.json(data);
            res.status(200);
        }
    });
}