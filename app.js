const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { sequelize, Book } = require('./models');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { error } = require('console');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	const err = new Error();
	err.status = 404;
	err.message = `Sorry! We couldn't find the page you were looking for.`;
	res.render('page-not-found', { err });
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	err.status = err.status || 500;
	err.message = `Sorry! There was an unexpected error on the server.`;
	console.log(err.status, err.message);
	res.status(err.status);
	res.render('error', { err });
	next(err);
});

(async () => {
	await sequelize.sync();
	try {
		await sequelize.authenticate();
		console.log('Connection to the database successful!');
	} catch (error) {
		console.log('Error connecting to the database', error);
	}
})();

module.exports = app;
