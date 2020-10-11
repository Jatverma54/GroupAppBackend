const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const groupRouter = require('./routes/groups');
const groupPostRouter = require('./routes/posts');
const bodyParser =require('body-parser');
const connection = require('./common/connection');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
//app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '200mb' }));
//app.use(bodyParser.json({ 'type': '*/*',limit: '200mb' }));
app.use(bodyParser.urlencoded({limit: '200mb', parameterLimit: 200000,extended: true}));
app.use(express.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/groups', groupRouter);
app.use('/groupPost', groupPostRouter);

// app.use(bodyParser.json({limit: '200mb',extended: true}));
// app.use(bodyParser.urlencoded({limit: '200mb', parameterLimit: 200000,extended: true}));

app.get('/', function(req, res){
  res.render('form');
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000);
module.exports = app;
