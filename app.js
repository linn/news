"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var requestLogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var log = require('./logger');
var config = require('./config');
var newsRoutes = require('./routes/news');
var s3Routes = require('./routes/s3');
var notificationRoutes = require('./routes/notifications');
var pingApi = require('./routes/pingApi');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(requestLogger(config.requestLoggerFormat, { stream: log.stream }));

app.use(bodyParser.json());

app.use(cookieParser());

app.use('/news', express.static(path.join(__dirname, 'public')));
app.use('/news/bower_components',  express.static(__dirname + '/bower_components'));


app.get('/news/create', newsRoutes.getCreateNewsArticle);
app.get('/news/labels', newsRoutes.listLabels);
app.post('/news/upload', s3Routes.uploadImage);

app.get('/news/:articleId/edit', newsRoutes.getEditNewsArticle);
app.get('/news/:articleId', newsRoutes.getNewsArticle);
app.put('/news/:articleId', newsRoutes.putNewsArticle);
app.delete('/news/:articleId', newsRoutes.removeNewsArticle);

app.get('/news', newsRoutes.listNewsArticles);
app.get('/notifications', notificationRoutes.get);

// Ping
app.get('/ping', pingApi.ping);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    if (!err.status || err.status >= 500) {
        log.error(err);
    }
    res.status(err.status || 500);
    if (!req.accepts('html')) {
        res.json({
            message: err.message,
            error: config.stackTraceOnError ? err : {}
        });
    } else {
        res.render('error', {
            message: err.message,
            error: config.stackTraceOnError ? err : {}
        });
    }
});

module.exports = app;
