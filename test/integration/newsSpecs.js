"use strict";
var chai = require("chai");
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var mockery = require('mockery');
/*jshint -W079 */
var expect = chai.expect;
chai.use(sinonChai);

var expressTesting = require('linn-cloud-libs/testing/express');

describe('News Api', function () {
    var sut, loadCallbackArgs, saveCallbackArgs, removeCallbackArgs, listCallbackArgs, listLabelsArgs, newsRepositoryStub;
    beforeEach(function () {
        loadCallbackArgs = [];
        saveCallbackArgs = [];
        removeCallbackArgs = [];
        listCallbackArgs = [];
        listLabelsArgs = [];

        newsRepositoryStub = {
            findById: sinon.spy(function loadNewsByIdFromStub(id, callback) { callback.apply(null, loadCallbackArgs); }),
            addOrReplace: sinon.spy(function addNewsByIdToStub(item, callback) { callback.apply(null, saveCallbackArgs); }),
            remove: sinon.spy(function removeByIdFromStub(id, callback) { callback.apply(null, removeCallbackArgs); }),
            listCurrentArticles: sinon.spy(function listCurrentArticles(callback) { callback.apply(null, listCallbackArgs); }),
            listLabels: sinon.spy(function listLabels(callback) { callback.apply(null, listLabelsArgs); })
        };

        mockery.enable({ useCleanCache: true });
        mockery.registerMock('../repositories/newsRepository', newsRepositoryStub);
        mockery.warnOnUnregistered(false);

        sut = require('../../routes/news');
    });
    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    describe('When getting labels', function () {
        var next, res, req, expectedData;
        beforeEach(function (done) {
            expectedData = { label1: 1, label2: 2 };
            listLabelsArgs[1] = expectedData;
            req = expressTesting.generateRequestStub('application/vnd.linn.news-labels+json; version=1');
            res = expressTesting.generateResponseStub(done);
            next = function(error) {
                res.statusCode = error.status;
                done();
            };
            sut.listLabels(req, res, next);
        });
        it('Should list all the labels', function () {
            expect(newsRepositoryStub.listLabels).to.have.been.called;
        });
        it('Should return Ok', function () {
            expect(res.statusCode).to.eql(200);
        });
        it('Should call res.json', function () {
            expect(res.json).to.have.been.called;
        });
        it('Should return correct json', function () {
            expect(res.json).to.have.been.calledWith(expectedData);
        });
    });
    describe('When adding a news article', function () {
        var next, res, req, expectedData;
        beforeEach(function (done) {
            var data = require('../data/newNewsArticle.json');
            expectedData = {
                articleId: 'TestArticle',
                title: data.title,
                content: data.content,
                summary: data.summary,
                labels: data.labels,
                date: sinon.match(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/),
                expiration: sinon.match(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/)
            };
            req = expressTesting.generateRequestStub('application/vnd.linn.news+json; version=1', { articleId: 'TestArticle' }, data);
            res = expressTesting.generateResponseStub(done);
            next = function(error) {
                res.statusCode = error.status;
                done();
            };
            sut.putNewsArticle(req, res, next);
        });
        it('Should add news article to repository', function () {
            expect(newsRepositoryStub.addOrReplace).to.have.been.calledWith(expectedData);
        });
        it('Should return created', function () {
            expect(res.statusCode).to.eql(201);
        });
        it('Should return json', function () {
            expect(res.json).to.have.been.calledWith(expectedData);
        });
        it('Should set Location', function () {
            expect(res.set).to.have.been.calledWith('Location', '/news/TestArticle');
        });
    });
    describe('When getting the create news article page', function () {
        var next, res, req;
        beforeEach(function (done) {
            req = expressTesting.generateRequestStub('text/html', { articleId: 'TestArticle' });
            res = expressTesting.generateResponseStub(done);
            next = function (error) {
                res.statusCode = error.status;
                done();
            };
            sut.getCreateNewsArticle(req, res, next);
        });
        it('Should render the create view', function () {
            expect(res.render).to.have.been.calledWith("create");
        });
    });
    describe('When getting the edit news article page', function () {
        var next, res, req, data;
        beforeEach(function (done) {
            data = require('../data/newsArticle.json');
            loadCallbackArgs[1] = data;
            req = expressTesting.generateRequestStub('text/html', { articleId: 'TestArticle' });
            res = expressTesting.generateResponseStub(done);
            next = function (error) {
                res.statusCode = error.status;
                done();
            };
            sut.getEditNewsArticle(req, res, next);
        });
        it('Should get a news article from the repository', function () {
            expect(newsRepositoryStub.findById).to.have.been.called;
        });
        it('Should render news article', function () {
            expect(res.render).to.have.been.calledWith("create", {
                title: data.title,
                md: sinon.match.any,
                content: data.content,
                labels: data.labels,
                date: sinon.match.any,
                prettyDate: sinon.match.any,
                summary: data.summary,
                href: '/news/' + data.articleId
            });
        });
    });
    describe('When getting a news article', function () {
        var next, res, req, data;
        beforeEach(function (done) {
            data = require('../data/newsArticle.json');
            loadCallbackArgs[1] = data;
            req = expressTesting.generateRequestStub('text/html', { articleId: 'TestArticle' });
            res = expressTesting.generateResponseStub(done);
            next = function (error) {
                res.statusCode = error.status;
                done();
            };
            sut.getNewsArticle(req, res, next);
        });
        it('Should get a news article from the repository', function () {
            expect(newsRepositoryStub.findById).to.have.been.called;
        });
        it('Should render news article', function () {
            expect(res.render).to.have.been.calledWith("news", {
                title: data.title,
                md: sinon.match.any,
                content: data.content,
                labels: data.labels,
                summary: data.summary,
                date: sinon.match.any,
                prettyDate: sinon.match.any,
                href: '/news/' + data.articleId
            });
        });
    });
    describe('When getting a news article that is missing', function () {
        var next, res, req;
        beforeEach(function (done) {
            req = expressTesting.generateRequestStub('application/json', { articleId: 'TestArticle' });
            res = expressTesting.generateResponseStub(done);
            next = function (error) {
                res.statusCode = error.status;
                done();
            };
            sut.getNewsArticle(req, res, next);
        });
        it('Should return not found', function () {
            expect(res.statusCode).to.eql(404);
        });
    });
    describe('When getting last 5 news articles', function () {
        var next, res, req;
        beforeEach(function (done) {
            listCallbackArgs[1] = require('../data/listNewsArticles.json')
            req = expressTesting.generateRequestStub('application/json', { count: 5 });
            res = expressTesting.generateResponseStub(done);
            next = function (error) {
                res.statusCode = error.status;
                done();
            };
            sut.listNewsArticles(req, res, next);
        });
        it('Should request items from repository', function () {
            expect(newsRepositoryStub.listCurrentArticles).to.have.been.called;
        });
        it('Should return Ok', function () {
            expect(res.statusCode).to.eql(200);
        });
        it('Should call res.json', function () {
            expect(res.json).to.have.been.called;
        });
        it('Should return correct json', function () {
            expect(res.json).to.have.been.calledWith({
                posts: require('../data/expectedListReverse.json'),
                links: [{ rel: 'all', href: '' }]
            });
        });
    });
});
