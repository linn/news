"use strict";
var async = require('async');
var Ddl = require('./libs/ddl').Ddl;

module.exports = {
    showStackTraceOnError: true,
    awsRegion: 'eu-west-1',
    dynamoDb: {
        tables: {
            news: "linn.cloud.news.int"
        },
        indices: {}
    },
    s3: {
        buckets: {
            newsAttachments: "linn.cloud.news.attachments.int"
        }
    }
};

module.exports.reset = function reset(callback) {
    var ddl = new Ddl(module.exports);

    async.series([
        function(iterCallback){
            ddl.deleteTable(module.exports.dynamoDb.tables.news, iterCallback);
        },
        function(iterCallback) {
            ddl.deleteS3Bucket(module.exports.s3.buckets.newsAttachments, iterCallback);
        },
        function(iterCallback){
            ddl.createTable(
                module.exports.dynamoDb.tables.news,
                {
                    hashKey: 'articleId'
                },
                null,
                iterCallback);
        },
        function(iterCallback) {
            ddl.createS3Bucket(module.exports.s3.buckets.newsAttachments, iterCallback);
        }
    ], function(err) {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};