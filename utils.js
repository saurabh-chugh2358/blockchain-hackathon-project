var bodyParser = require('body-parser');    
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');

/**
 * Create and initialize an Express application that is 'fully loaded' and
 * ready for usage!
 *
 * This will also handle setting up all dependencies (like database
 * connections).
 *
 * @returns {Object} - An Express app object.
 */
module.exports.createApp = function() {
    
    
  //initialize mongoose schemas
  require('./models/models');
  var api = require('./routes/api');
  var authenticate = require('./routes/authenticate')(passport);
  var mongoose = require('mongoose');                         //add for Mongo support
  mongoose.connect('mongodb://localhost/bituaDB');         //connect to Mongo

  var app = express();

    
  // settings
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // middleware
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(favicon(__dirname + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(session({
    cookieName: 'session',
    secret: 'keyboard cat',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    resave: false,
    saveUninitialized: false
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(passport.initialize());
  app.use(passport.session());
  
  //routing details 
  app.use('/auth', authenticate);
  app.use('/api', api);
  app.get('/', function(req, res) {
    res.render('index.jade');
  });
  
    
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

    
    
  //// Initialize Passport
  var initPassport = require('./passport-init');
  initPassport(passport);

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
     app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({state: 'failure', user: null, message: "Invalid username or password"});
        
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
  
  return app;
};

