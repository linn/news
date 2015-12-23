"use strict";

let Ddl = require('./libs/ddl').Ddl;
let async = require('async');

module.exports.reset = function reset(callback) {
    let ddl = new Ddl(module.exports);
    async.series([
        (iterCallback) => ddl.deleteTable(module.exports.dynamoDb.tables.news, iterCallback),
        (iterCallback) => ddl.deleteS3Bucket(module.exports.s3.buckets.newsAttachments, iterCallback),
        (iterCallback) => {
            ddl.createTable(
                module.exports.dynamoDb.tables.news,
                {
                    hashKey: 'articleId'
                },
                null,
                iterCallback);
        },
        (iterCallback) => ddl.createS3Bucket(module.exports.s3.buckets.newsAttachments, iterCallback),
    ], (err) => {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};