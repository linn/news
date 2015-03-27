"use strict";
var repository = require('../repositories/newsRepository');

var _ = require('underscore');

var moment = require('moment');

function createModel(req) {
    var postDate = new Date();
    var expirationDate = new Date();
    expirationDate.setDate(postDate.getDate() + (req.body.lifespan || 30));
    return {
        articleId: req.params.articleId,
        labels: req.body.labels || [],
        content: req.body.content || "",
        title: req.body.title || "",
        date: postDate.toISOString(),
        expiration: expirationDate.toISOString()
    };
}

function toNewsListResource(model) {
    var resource = _.clone(model);
    resource.links = [{
        "rel": "self",
        "href": "/news/"+model.articleId
    }];
    return resource;
}

function toNewsViewModel(model) {
    return {
        title: model.title,
        labels: model.labels,
        md: require('node-markdown').Markdown,
        content: model.content,
        date: moment(model.date).format('MMMM Do YYYY, HH:mm'),
        prettyDate: moment(model.date).fromNow()
    };
}

module.exports.getNewsArticle = function getNewsArticle(req, res, next) {
    repository.findById(req.params.articleId, function (err, data) {
        if (err) {
            next(err);
        } else if (!data) {
            err = new Error("Not found");
            err.status = 404;
            next(err);
        } else {
            res.render('news', toNewsViewModel(data));
        }
    });
};

module.exports.putNewsArticle = function putNewsArticle(req, res, next) {
    var model = createModel(req);
    repository.addOrReplace(model, function(err) {
        if (err) {
            next(err);
        } else {
            res.set('Location', '/news/' + model.articleId);
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
            res.json(_.chain(data).sortBy('date').last(numArticles).map(toNewsListResource).value());
            res.status(200);
        }
    });
};
