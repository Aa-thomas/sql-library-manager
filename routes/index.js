var express = require('express');
const createHttpError = require('http-errors');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require('sequelize');

/* GET home page. */
router.get('/', async function (req, res, next) {
	res.redirect('/books');
});

//  Shows the full list of books
router.get('/books', async function (req, res, next) {
	const books = await Book.findAll();
	res.render('index', { books });
});

// search for books
router.get("/books/search", async (req, res) => {
	const search = req.query.search;
	console.dir(req.query.search);
 
	if (!search) {
	  res.render("no-books-error", { books: [], message: "Please enter a search term" });
	  return;
	}
 
	const books = await Book.findAll({
	  attributes: ["title", "author", "genre", "year"],
	  where: {
		 [Op.or]: [
			{ title: { [Op.like]: `%${search}%` } },
			{ author: { [Op.like]: `%${search}%` } },
			{ genre: { [Op.like]: `%${search}%` } },
			{ year: { [Op.eq]: search } }
		 ]
	  }
	});
	if (books.length === 0) {
	  res.render("no-books-error", { books, message: "No books found" });
	  return;
	}
	res.render("index", { books });
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
		res.redirect('/books');
	} catch (error) {
		if (error.name === 'SequelizeValidationError') {
			book = await Book.build(req.body);
			res.render('new-book', {
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
			res.redirect('/books');
		} else {
			res.sendStatus(404);
		}
	} catch (error) {
		if (error.name === 'SequelizeValidationError') {
			book = await Book.build(req.body);
			book.id = req.params.id;
			res.render('update-book', {
				book,
				errors: error.errors,
				title: book.title,
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
		next(createHttpError(404));
	}
});

module.exports = router;
