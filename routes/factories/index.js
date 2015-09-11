"use strict";
var moment = require('moment');
var _ = require('underscore');

function generateHref(model) {
    return "/news/"+model.articleId;
}
module.exports.generateHref = generateHref;

module.exports.createModel = function createModel(req) {
    if (!req.body.summary) {
        throw new Error("Missing Summary");
    }

    if (!req.body.title) {
        throw new Error("Missing Title");
    }

    if (!req.body.content) {
        throw new Error("Missing Content");
    }

    var postDate = new Date();
    var expirationDate = new Date();
    expirationDate.setDate(postDate.getDate() + (req.body.lifespan || 14));
    return {
        articleId: req.params.articleId,
        labels: _.isArray(req.body.labels) ? _.compact(req.body.labels) : [],
        content: req.body.content || "",
        summary: req.body.summary || "",
        title: req.body.title || "",
        date: postDate.toISOString(),
        expiration: expirationDate.toISOString()
    };
};

function toASPDate(date) {
    return "\/Date(" + new Date(date).getTime() + ")\/";
}

module.exports.toNotificationsResource = function toNotificationsResource(models) {
    return {
        notifications: _.map(models, this.toNewsSummaryResource)
    };
};

module.exports.toNewsListResource = function toNewsListResource(models) {
    var resource = {
        posts: _.map(models, this.toNewsSummaryResource)
    };
    resource.links = [{
        "rel": "all",
        "href": ""
    }];
    return resource;
};

module.exports.toNewsSummaryResource = function toNewsSummaryResource(model) {
    var resource = {
        created: toASPDate(model.date),
        labels: model.labels,
        content: model.summary,
        title: model.title
    };
    resource.links = [{
        "rel": "self",
        "href": generateHref(model)
    }];
    return resource;
};

module.exports.toNewsViewModel = function toNewsViewModel(model) {
    return {
        title: model.title,
        labels: model.labels,
        summary: model.summary,
        md: require('node-markdown').Markdown,
        content: model.content,
        date: moment(model.date).format('MMMM Do YYYY, HH:mm'),
        prettyDate: moment(model.date).fromNow(),
        href: generateHref(model)
    };
};