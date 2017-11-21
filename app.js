var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var promotions=require('./routes/promotions');
var token=require('./routes/token');
var content=require('./routes/contents');
var utilsJs=require('./routes/utils');
var boom = require('express-boom');


var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(boom());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/doc', express.static('doc',{root:'doc'}));
app.use('/node_modules', express.static('node_modules',{root:'node_modules'}));


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, Authorization, Content-Length, X-Requested-With');
  if ('OPTIONS' == req.method) res.send(200);
  else next();
});

app.use('/utils',utilsJs);
//app.use('/promotions',promotions);
app.use('/contents',content);
app.use('/token',token);
app.use('/mobile/',     require('./routes/mobile'));
app.use('/activities',  require("./routes/activities"));
app.use('/search',      require("./routes/search"));
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
