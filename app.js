'use strict';

var express = require('express');
var routes = require('./routes/index');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use('/', routes);

module.exports = app;
