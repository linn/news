"use strict";
var multiparty = require('multiparty');
var fs = require('fs');
var config = require('linn-cloud-libs/config');

var aws = require('aws-sdk');
aws.config.region = config.awsRegion;

var s3 = new aws.S3();

var AWS = require('aws-sdk');

function generateUri(key) {
    return 'http://' + config.s3.buckets.newsAttachments + ".s3.amazonaws.com/" + key;
}

exports.uploadImage = function streamToS3(req, res, next) {
    var form = new multiparty.Form();
    form.on('part', function(part) {
        var params = {
            Bucket: config.s3.buckets.newsAttachments,
            Key: part.filename,
            ACL: 'public-read',
            Body: part,
            ContentDisposition: 'attachment; filename=' + part.filename,
            ContentType: part.headers['content-type'],
            ContentLength: part.byteCount
        };
        s3.putObject(params, function(err, data) {
            if (err) {
                next(err);
            } else {
                res.json([generateUri(params.Key)]);
            }
        });
    });
    form.parse(req);
}