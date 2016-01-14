"use strict";

let config = require('12factor-config');
let dotenv = require('dotenv');

dotenv.config({silent: true});

let cfg = config({
    stackTraceOnError: {
        env      : 'STACK_TRACE_ON_ERROR',
        type     : 'boolean',
        default  : 'true',
        required : false
    },
    requestLoggerFormat: {
        env      : 'REQUEST_LOGGER_FORMAT',
        type     : 'string',
        default  : ':remote-addr :method :url :status :response-time',
        required : true
    },
    processTitle: {
        env      : 'PROCESS_TITLE',
        type     : 'string',
        required : true
    },
    awsRegion : {
        env      : 'AWS_REGION',
        type     : 'string',
        required : true
    },
    awsAccessKeyId : {
        env      : 'AWS_ACCESS_KEY_ID',
        type     : 'string',
        required : true
    },
    awsSecretAccessKey : {
        env      : 'AWS_SECRET_ACCESS_KEY',
        type     : 'string',
        required : true
    },
    port : {
        env      : 'PORT',
        type     : 'integer',
        required : true
    },
    newsTableName: {
        env      : 'NEWS_TABLE_NAME',
        type     : 'string',
        required : true
    },
    newsAttachmentsBucket: {
        env      : 'NEWS_ATTACHMENTS_BUCKET',
        type     : 'string',
        required : true
    },
    env : {
        env      : 'NODE_ENV',
        type     : 'enum',
        values   : [ 'test', 'debug', 'int', 'release' ]
    }
});

// restrict this based on NODE_ENV
cfg.reset = cfg.env !== 'release';

module.exports = cfg;