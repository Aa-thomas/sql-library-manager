var express = require('express');
const createHttpError = require('http-errors');
var router = express.Router();
const Book = require('../models').Book;

/* GET home page. */
router.get('/', async function (req, res, next) {
	res.redirect('/books');
});

//  Shows the full list of books
router.get('/books', async function (req, res, next) {
	const books = await Book.findAll();
	res.render('index', { books });
});

// Shows the create new book form
router.get('/books/new', async function (req, res, next) {
	res.render('new-book', { book: {}, title: 'New Book' });
});

// Posts a new book to the database
router.post('/books/new', async function (req, res, next) {
	let book;
	try {
		book = await Book.create(req.body);
		res.redirect('/books/' + book.id);
	} catch (error) {
		if (error.name === 'SequelizeValidationError') {
			book = await Book.build(req.body);
			res.render('books/new', {
				book,
				errors: error.errors,
				title: 'New Book',
			});
		} else {
			throw error;
		}
	}
});

// Shows book detail form
router.get('/books/:id', async function (req, res, next) {
	const book = await Book.findByPk(req.params.id);
	if (book) {
		res.render('update-book', { book, title: book.title });
	} else {
		next(createHttpError(404));
	}
});

// Updates book info in the database
router.post('/books/:id', async function (req, res, next) {
	let book;
	try {
		book = await Book.findByPk(req.params.id);
		if (book) {
			await book.update(req.body);
			res.redirect('/books/' + book.id);
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		if (error.name === 'SequelizeValidationError') {
			book = await Book.build(req.body);
			res.render('books/new', {
				book,
				errors: error.errors,
				title: 'New Book',
			});
		} else {
			throw error;
		}
	}
});

// Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting
router.post('/books/:id/delete', async function (req, res, next) {
	const book = await Book.findByPk(req.params.id);
	if (book) {
		await book.destroy();
		res.redirect('/books');
	} else {
		res.createHttpError(404);
	}
});

module.exports = router;
