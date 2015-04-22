"use strict";
var moment = require('moment');
var _ = require('underscore');

function generateHref(model) {
    return "/news/"+model.articleId;
}
module.exports.generateHref = generateHref;

module.exports.createModel = function createModel(req) {
    var postDate = new Date();
    var expirationDate = new Date();
    expirationDate.setDate(postDate.getDate() + (req.body.lifespan || 30));
    return {
        articleId: req.params.articleId,
        labels: _.isArray(req.body.labels) ? _.compact(req.body.labels) : [],
        content: req.body.content || "",
        title: req.body.title || "",
        date: postDate.toISOString(),
        expiration: expirationDate.toISOString()
    };
};

module.exports.toNewsListResource = function toNewsListResource(model) {
    var resource = _.clone(model);
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
        md: require('node-markdown').Markdown,
        content: model.content,
        date: moment(model.date).format('MMMM Do YYYY, HH:mm'),
        prettyDate: moment(model.date).fromNow(),
        href: generateHref(model)
    };
};