"use strict";
var chai = require("chai");
var chaiDateTime = require('chai-datetime');
/*jshint -W079 */
var expect = chai.expect;
chai.use(chaiDateTime);

var sut = require('../../routes/factories');

describe('Factories', function () {
    describe('Create Resource from Model', function () {
        var model, resource;
        beforeEach(function () {
            model = {
                "date": "2015-03-27T12:13:42.316Z",
                "articleId": "NewsTest",
                "labels": [ "test", "new" ],
                "expiration": "2015-03-30T11:13:42.316Z",
                "title": "This is a test of the add news route",
                "content": "#New Article\n\nNews articles can now be written using /markdown/ - **woo!**"
            };
            resource = sut.toNewsListResource(model);
        });
        it('Should include date', function () {
            expect(resource.date).to.eql(model.date);
        });
        it('Should include articleId', function () {
            expect(resource.articleId).to.eql(model.articleId);
        });
        it('Should include labels', function () {
            expect(resource.labels).to.eql(model.labels);
        });
        it('Should include expiration', function () {
            expect(resource.expiration).to.eql(model.expiration);
        });
        it('Should include title', function () {
            expect(resource.title).to.eql(model.title);
        });
        it('Should include content', function () {
            expect(resource.content).to.eql(model.content);
        });
        it('Should include links and a self rel', function () {
            expect(resource.links).to.eql([{ rel: 'self', href: '/news/NewsTest' }]);
        });
    });
    describe('Create Model from Request', function () {
        describe('When creating', function () {
            var model;
            beforeEach(function () {
                model = sut.createModel({
                    params: {
                        articleId: 'article_id'
                    },
                    body: {
                        labels: [ 'label1', 'label2' ],
                        content: '#header/nLook this is Markdown!',
                        title: 'This is the Title'
                    }
                });
            });
            it('Should populate article id', function () {
                expect(model.articleId).to.eql('article_id');
            });
            it('Should populate labels', function () {
                expect(model.labels).to.eql([ 'label1', 'label2' ]);
            });
            it('Should populate content', function () {
                expect(model.content).to.eql('#header/nLook this is Markdown!');
            });
            it('Should populate title', function () {
                expect(model.title).to.eql('This is the Title');
            });
            it('Should populate post date', function () {
                expect(new Date(model.date)).to.equalDate(new Date());
            });
            it('Should populate expiration date 30 days after post date', function () {
                var expectedExpiration = new Date(model.date);
                expectedExpiration.setDate(expectedExpiration.getDate() + 30);
                expect(new Date(model.expiration)).to.equalDate(expectedExpiration);
            });
        });
        describe('When creating with specific lifespan', function () {
            var model;
            beforeEach(function () {
                model = sut.createModel({
                    params: {
                        articleId: 'article_id'
                    },
                    body: {
                        labels: [ 'label1', 'label2' ],
                        content: '#header/nLook this is Markdown!',
                        title: 'This is the Title',
                        lifespan: 5
                    }
                });
            });
            it('Should populate expiration date 5 days after post date', function () {
                var expectedExpiration = new Date(model.date);
                expectedExpiration.setDate(expectedExpiration.getDate() + 5);
                expect(new Date(model.expiration)).to.equalDate(expectedExpiration);
            });
        });
        describe('When creating with empty string label', function () {
            var model;
            beforeEach(function () {
                model = sut.createModel({
                    params: {
                        articleId: 'article_id'
                    },
                    body: {
                        labels: [ 'label1', '' ],
                        content: '#header/nLook this is Markdown!',
                        title: 'This is the Title'
                    }
                });
            });
            it('Should remove empty label', function () {
                expect(model.labels).to.eql([ 'label1' ]);
            });
        });
        describe('When creating with invalid labels', function () {
            var model;
            beforeEach(function () {
                model = sut.createModel({
                    params: {
                        articleId: 'article_id'
                    },
                    body: {
                        labels: 'label1',
                        content: '#header/nLook this is Markdown!',
                        title: 'This is the Title'
                    }
                });
            });
            it('Should replace with empty label', function () {
                expect(model.labels).to.eql([]);
            });
        });
        describe('When creating with missing data', function () {
            var model;
            beforeEach(function () {
                model = sut.createModel({
                    params: {
                        articleId: 'article_id'
                    },
                    body: {
                    }
                });
            });
            it('Should replace with empty label', function () {
                expect(model.labels).to.eql([]);
            });
            it('Should replace content with empty', function () {
                expect(model.content).to.eql('');
            });
            it('Should replace title with empty', function () {
                expect(model.title).to.eql('');
            });
        });
    });
});