"use strict";

let config = require('linn-cloud-libs/config');
let Repository = require('repository-dynamodb');
let repository = new Repository(config.awsRegion, config.dynamoDb.tables.news, "articleId");
let _ = require('underscore');

repository.listCurrentArticles = function scanDynamoDbForCurrentArticles(callback) {
    let params = {
        TableName: config.dynamoDb.tables.news,
        ExpressionAttributeNames: {
            "#D": "date",
            "#E": "expiration"
        },
        ExpressionAttributeValues: {
            ":NOW": new Date().toISOString()
        },
        FilterExpression: ':NOW between #D and #E'
    };
    this.docClient.scan(params, function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, data.Items);
        }
    });
};
repository.listLabels = function scanDynamoDbForAllLabels(callback) {
    let params = {
        TableName: config.dynamoDb.tables.news,
        ExpressionAttributeNames: {
            "#L": "labels"
        },
        ExpressionAttributeValues: {
            ":ZERO": 0
        },
        ProjectionExpression: "#L",
        FilterExpression: 'size(#L) > :ZERO'
    };
    this.docClient.scan(params, function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, _.chain(data.Items).pluck('labels').flatten().countBy().value());
        }
    });
};
module.exports = repository;