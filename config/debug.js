"use strict";

module.exports = {
    showStackTraceOnError: true,
    awsRegion: 'eu-west-1',
    dynamoDb: {
        tables: {
            news: "linn.cloud.news.debug"
        },
        indices: {}
    },
    s3: {
        buckets: {
            newsAttachments: "linn.cloud.news.attachments.debug"
        }
    },
    reset: true
};