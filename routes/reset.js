"use strict";

let Ddl = require('./libs/ddl').Ddl;
let async = require('async');
let config = require('linn-cloud-libs/config');

module.exports.reset = function reset(callback) {
    let ddl = new Ddl(config);
    async.series([
        (iterCallback) => ddl.deleteTable(config.dynamoDb.tables.news, iterCallback),
        (iterCallback) => ddl.deleteS3Bucket(config.s3.buckets.newsAttachments, iterCallback),
        (iterCallback) => {
            ddl.createTable(
                config.dynamoDb.tables.news,
                {
                    hashKey: 'articleId'
                },
                null,
                iterCallback);
        },
        (iterCallback) => ddl.createS3Bucket(config.s3.buckets.newsAttachments, iterCallback),
    ], (err) => {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};