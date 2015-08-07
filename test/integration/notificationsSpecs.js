"use strict";
var chai = require("chai");
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var mockery = require('mockery');
/*jshint -W079 */
var expect = chai.expect;
chai.use(sinonChai);

var expressTesting = require('linn-cloud-libs/testing/express');

describe('Notifications Api', function () {
    var sut, loadCallbackArgs, saveCallbackArgs, removeCallbackArgs, listCallbackArgs, newsRepositoryStub;
    beforeEach(function () {
        loadCallbackArgs = [];
        saveCallbackArgs = [];
        removeCallbackArgs = [];
        listCallbackArgs = [];

        newsRepositoryStub = {
            findById: sinon.spy(function loadNewsByIdFromStub(id, callback) { callback.apply(null, loadCallbackArgs); }),
            addOrReplace: sinon.spy(function addNewsByIdToStub(item, callback) { callback.apply(null, saveCallbackArgs); }),
            remove: sinon.spy(function removeByIdFromStub(id, callback) { callback.apply(null, removeCallbackArgs); }),
            listCurrentArticles: sinon.spy(function listCurrentArticles(callback) { callback.apply(null, listCallbackArgs); })
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('../repositories/newsRepository', newsRepositoryStub);
        mockery.warnOnUnregistered(false);

        sut = require('../../routes/notifications');
    });
    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    describe('When getting notifications', function () {
        var next, res, req;
        beforeEach(function (done) {
            listCallbackArgs[1] = require('../data/listNewsArticles.json')
            req = expressTesting.generateRequestStub('application/json');
            res = expressTesting.generateResponseStub(done);
            next = function (error) {
                res.statusCode = error.status;
                done();
            };
            sut.get(req, res, next);
        });
        it('Should request items from repository', function () {
            expect(newsRepositoryStub.listCurrentArticles).to.have.been.called;
        });
        it('Should return Ok', function () {
            expect(res.statusCode).to.eql(200);
        });
        it('Should return json', function () {
            expect(res.json).to.have.been.called;
        });
        it('Should return the last 5 news articles json', function () {
            expect(res.json).to.have.been.calledWith(require('../data/expectedList.json'));
        });
    });
});