"use strict";

var sinon = require('sinon');

module.exports.generateResponseStub = function generateResponseStub(done) {
    return {
        json: sinon.spy(),
        status: function(statusCode) {
            this.statusCode = statusCode;
            done();
        },
        send: sinon.spy(),
        render: sinon.spy(function () {
            done();
        }),
        sendStatus: function(statusCode) {
            this.statusCode = statusCode;
            done();
        },
        set: sinon.spy()
    };
};

module.exports.generateRequestStub = function generateRequestStub(mediaType, parameters, body) {
    var headers = {
        'Accept': mediaType,
        'Content-Type': mediaType
    };
    return {
        accepts: function () {
            return headers['Accept'];
        },
        header: function (headerName) {
            return headers[headerName];
        },
        params: parameters,
        query: parameters,
        body: body
    };
};