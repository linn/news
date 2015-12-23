"use strict";
var aws = require('aws-sdk');
var _ = require('underscore');

module.exports.Ddl = function Ddl(config) {

    aws.config.region = config.awsRegion;

    var dynamodb = new aws.DynamoDB();
    var s3 = new aws.S3();

    function checkItHasGone(tableName, callback) {
        var params = {
            TableName: tableName
        };
        dynamodb.describeTable(params, function (err, data) {
            if (err) {
                if (err.code === 'ResourceNotFoundException') {
                    callback();
                } else {
                    callback(err);
                }
            }
            else {
                if (data.Table.TableStatus === 'DELETING') {
                    setTimeout(function () {
                        checkItHasGone(tableName, callback);
                    }, 2000);
                }
                else {
                    callback();
                }
            }
        });
    }

    function checkIsThere(tableName, callback) {
        var params = {
            TableName: tableName
        };
        dynamodb.describeTable(params, function (err, data) {
            if (err) {
                if (err.code === 'ResourceNotFoundException') {
                    callback();
                } else {
                    callback(err);
                }
            }
            else {
                if (data.Table.TableStatus === 'CREATING') {
                    setTimeout(function () {
                        checkIsThere(tableName, callback);
                    }, 2000);
                }
                else {
                    callback();
                }
            }
        });
    }

    this.deleteTable = function deleteTable(tableName, callback) {
        var params = {
            TableName: tableName
        };
        config.logger.info('Deleting table ' + tableName);
        dynamodb.deleteTable(params, function (err) {
            if (err) {
                if (err.code === 'ResourceNotFoundException') {
                    callback();
                } else {
                    callback(err);
                }
            }
            else {
                checkItHasGone(tableName, callback);
            }
        });
    };

    this.createTable  = function createTable(tableName, key, secondaryIndex, callback) {
        var params = {
            TableName: tableName,
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            KeySchema: [
                {
                    AttributeName: key.hashKey,
                    KeyType: 'HASH'
                }
            ],
            AttributeDefinitions: [
                {
                    AttributeName: key.hashKey,
                    AttributeType: 'S'
                }
            ]
        };
        if (key.rangeKey) {
            params.KeySchema.push({
                AttributeName: key.rangeKey,
                KeyType: 'RANGE'
            });
            params.AttributeDefinitions.push({
                AttributeName: key.rangeKey,
                AttributeType: 'S'
            });
        }
        if (secondaryIndex) {
            params.GlobalSecondaryIndexes = [
                {
                    IndexName: secondaryIndex.index,
                    KeySchema: [{
                        AttributeName: secondaryIndex.hash,
                        KeyType: 'HASH'
                    },
                        {
                            AttributeName: secondaryIndex.range,
                            KeyType: 'RANGE'
                        }],
                    Projection: {
                        ProjectionType: 'ALL'
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    }
                }
            ];
            params.AttributeDefinitions.push({
                AttributeName: secondaryIndex.hash,
                AttributeType: 'S'
            });
            params.AttributeDefinitions.push({
                AttributeName: secondaryIndex.range,
                AttributeType: 'S'
            });
        }
        config.logger.info('Creating table ' + tableName);
        dynamodb.createTable(params, function (err) {
            if (err) {
                callback(err);
            } else {
                checkIsThere(tableName, callback);
            }
        });
    };

    function deleteS3Objects(name, keys, callback) {
        var params = {
            Bucket: name,
            Delete: {
                Objects: _.map(keys, function (key) {
                    return {Key: key};
                }),
                Quiet: true
            }
        };
        config.logger.info('Deleting ' + keys.length + ' objects from ' + name);
        s3.deleteObjects(params, callback);
    }

    function setReadonlyPermissionsToAnonUsers(name, callback) {
        var params = {
            Bucket: name,
            Policy: JSON.stringify({
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "AllowPublicRead",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": ["arn:aws:s3:::" + name + "/*"]
                    }
                ]
            })
        };
        config.logger.info('Setting bucket policy for ' + name);
        s3.putBucketPolicy(params, callback);
    }

    function clearS3Bucket(name, callback) {
        var params = {
            Bucket: name
        };
        config.logger.info('Listing objects in bucket ' + name);
        s3.listObjects(params, function (err, data) {
            if (err && err.code === 'NoSuchBucket') {
                callback();
            } else if (err) {
                callback(err);
            } else {
                var keys = _.pluck(data.Contents, 'Key');
                if (keys.length === 0) {
                    config.logger.info('Bucket ' + name + ' is empty');
                    callback();
                } else {
                    deleteS3Objects(name, keys, function () {
                        setTimeout(function () {
                            clearS3Bucket(name, callback);
                        }, 500);
                    });
                }
            }
        });
    }

    this.deleteS3Bucket = function deleteS3Bucket(name, callback) {
        var params = {
            Bucket: name
        };
        clearS3Bucket(name, function (err) {
            if (err) {
                callback(err);
            } else {
                config.logger.info('Deleting bucket ' + name);
                s3.deleteBucket(params, function (err) {
                    if (err && err.code === 'NoSuchBucket') {
                        callback();
                    } else if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            }
        });
    };

    this.createS3Bucket = function createS3Bucket(name, callback) {
        var params = {
            Bucket: name
        };
        config.logger.info('Creating bucket ' + name);
        s3.createBucket(params, function () {
            setReadonlyPermissionsToAnonUsers(name, callback);
        });
    };
};