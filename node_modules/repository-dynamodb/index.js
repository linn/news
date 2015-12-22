"use strict";

let aws = require('aws-sdk');
let doc = require('dynamodb-doc');


module.exports = function DynamoDbRepository(awsRegion, tableName, hashKey, rangeKey) {
    aws.config.region = awsRegion;
    let docClient = new doc.DynamoDB();
    function findByIdAndRangeKeyFromDynamoDb(id, range, callback) {
        let params = {
            TableName: tableName,
            Key: {}
        };
        params.Key[hashKey] = id;
        params.Key[rangeKey] = range;
        docClient.getItem(params, function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, result.Item);
            }
        });
    }
    function findByIdFromDynamoDb(id, callback) {
        let params = {
            TableName: tableName,
            Key: {}
        };
        params.Key[hashKey] = id;
        docClient.getItem(params, function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, result.Item);
            }
        });
    }
    function addOrReplaceToDynamoDb(item, callback) {
        let params = {
            TableName: tableName,
            Item: item
        };
        docClient.putItem(params, callback);
    }
    function removeByIdFromDynamoDb(id, callback) {
        let params = {
            TableName: tableName,
            Key: {}
        };
        params.Key[hashKey] = id;
        docClient.deleteItem(params, function (err) {
            if (err) {
                callback(err);
            } else {
                callback();
            }
        })
    }
    function removeByIdAndRangeKeyFromDynamoDb(id, range, callback) {
        let params = {
            TableName: tableName,
            Key: {}
        };
        params.Key[hashKey] = id;
        params.Key[rangeKey] = range;
        docClient.deleteItem(params, function (err) {
            if (err) {
                callback(err);
            } else {
                callback();
            }
        })
    }
    function findBy(arg1, arg2, arg3) {
        if (typeof(arg2) === 'function') {
            findByIdFromDynamoDb(arg1, arg2);
        } else {
            findByIdAndRangeKeyFromDynamoDb(arg1, arg2, arg3);
        }
    }
    function removeBy(arg1, arg2, arg3) {
        if (typeof(arg2) === 'function') {
            removeByIdFromDynamoDb(arg1, arg2);
        } else {
            removeByIdAndRangeKeyFromDynamoDb(arg1, arg2, arg3);
        }
    }
    return {
        docClient: docClient,
        findBy: findBy,
        addOrReplace: addOrReplaceToDynamoDb,
        removeBy: removeBy
    };
};
