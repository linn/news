"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('linn-cloud-libs/config');
var newsRoutes = require('./routes/news');
var s3Routes = require('./routes/s3');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger(config.requestLoggerFormat, { stream: config.logger.stream }));

app.use(bodyParser.json());

app.use(cookieParser());

app.use('/news', express.static(path.join(__dirname, 'public')));
app.use('/news/bower_components',  express.static(__dirname + '/bower_components'));

// Application
app.get('/news/create', newsRoutes.getCreateNewsArticle);
app.get('/news/:articleId/edit', newsRoutes.getEditNewsArticle);
app.get('/news/:articleId', newsRoutes.getNewsArticle);

// API
app.post('/news/upload', s3Routes.uploadImage);
app.put('/news/:articleId', newsRoutes.putNewsArticle);
app.get('/news', newsRoutes.listNewsArticles);

if (config.reset) {
    app.delete('/reset', function (req, res, next) {
        config.reset(function(err) {
            if (err) {
                next(err);
            } else {
                res.sendStatus(204);
            }
        });
    });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    if (!err.status || err.status >= 500) {
        config.logger.error(err);
    }
    res.status(err.status || 500);
    if (!req.accepts('html')) {
        res.json({
            message: err.message,
            error: config.showStackTraceOnError ? err : {}
        });
    } else {
        res.render('error', {
            message: err.message,
            error: config.showStackTraceOnError ? err : {}
        });
    }
});

module.exports = app;
