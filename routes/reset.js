"use strict";

let Ddl = require('./libs/ddl').Ddl;
let async = require('async');
let config = require('../config');

module.exports.reset = function reset(callback) {
    let ddl = new Ddl(config);
    async.series([
        (iterCallback) => ddl.deleteTable(config.newsTableName, iterCallback),
        (iterCallback) => ddl.deleteS3Bucket(config.newsAttachmentsBucket, iterCallback),
        (iterCallback) => {
            ddl.createTable(
                config.dynamoDb.tables.news,
                {
                    hashKey: 'articleId'
                },
                null,
                iterCallback);
        },
        (iterCallback) => ddl.createS3Bucket(config.newsAttachmentsBucket, iterCallback),
    ], (err) => {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    });
};