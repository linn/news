"use strict";

var config = require('linn-cloud-libs/config');
var CloudRepository = require('linn-cloud-libs/dynamodb/repositories/cloudRepository').CloudRepository;
var repository = new CloudRepository(config.dynamoDb.tables.news, "articleId");

repository.listCurrentArticles = function scanDynamoDbForCurrentArticles(callback) {
    var params = {
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
module.exports = repository;