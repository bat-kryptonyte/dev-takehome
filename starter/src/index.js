const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

// console.log(process.env.MONGODB_URI);

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require ("jsonwebtoken");
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// MongoDB models
const { User, Book, ReadingLog } = require('./mongo_models');


// Middleware
app.use(bodyParser.json());
console.log(process.env.MONGODB_URI);


// Database connection
mongoose.connect(process.env.MONGODB_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
})
.then(() => console.log('⚡️ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));


// Health check
app.get('/api/health', (req, res) => {
    res.json({ healthy: true });
});


function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length == 2 && parts[0] == 'Bearer') {
        token = parts[1];
    }
  }
  if (!token) {
    return res.status(400).json({ message: 'Null token' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
        return res.status(400).json({ message: 'Bad token' });
    }
    req.user = decoded;
    next();
  });
}


// TODO: Define your route handlers below

// — Level 1 CRUD endpoints —
// POST /api/user       → create a new User
// POST /api/book       → create a new Book
// POST /api/reading    → create a new ReadingLog

// — Level 2 Admin views —
// GET  /api/admin/users    → list all Users
// GET  /api/admin/books    → list all Books
// GET  /api/admin/reading  → list all ReadingLogs

// — Level 3 Authentication (optional) —
// POST /api/user/login     → authenticate and issue JWT
// (then protect your other routes via middleware)

// You can scaffold each handler like this:

// app.post('/api/user', async (req, res) => { … });
// app.post('/api/book', async (req, res) => { … });
// app.post('/api/reading', async (req, res) => { … });


// Create new user
app.post('/api/user', async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json( {message: "Request parameters error"});
        }

        const timestamp = new Date();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create newUser object
        const newUser = new User( {
            name: name,
            email: email,
            password: hashedPassword,
            createdAt: timestamp
        });
        // Save newUser in MongoDB
        await newUser.save();
        return res.status(200).json( {message: "New user created!"});

    } catch (error) {
        return res.status(400).json( {message: "Error in creating new user"});
    }
});


// Create new book
app.post('/api/book', authMiddleware, async (req, res) => {
    try {
        const {title, author} = req.body;
        const ownerId = req.user.userId;

        if (!title || !author || !ownerId) {
            return res.status(400).json( {message: "Request parameters error"});
        }

        const timestamp = new Date();

        // Create new book object
        const newBook = new Book( {
            title: title,
            author: author,
            ownerId: ownerId,
            createdAt: timestamp
        });

        // Save new book in MongoDB
        await newBook.save();
        return res.status(200).json( {message: "New book successfully created."});

    } catch (error) {
        return res.status(400).json( {message: error.message});
    }
});

// Create new reading log
app.post('/api/reading', authMiddleware, async (req, res) => {
    try {
        const {bookId, date, notes} = req.body;
        const userId = req.user.userId;

        if (!bookId || !date || !notes) {
            return res.status(400).json( {message: "Request parameters error"});
        }
        

        // Level 2: Check bookId belongs to authenticated ownerId
        const book = await Book.findById(bookId);
        if(!book) {
            return res.status(400).json( {message: "Couldn't find book"})
        }

        if (book.ownerId.toString() !== userId) {
            return res.status(400).json( {message: "User doesn't have the book"});
        }
    
        const timestamp = new Date();

        // Create new reading log object
        const newReadingLog = new ReadingLog( {
            bookId: bookId,
            date: date,
            notes: notes,
            createdAt: timestamp
        });

        // Save new reading log in MongoDB
        await newReadingLog.save();
        return res.status(200).json( {message: "New reading log successfully added!"});

    } catch (error) {
        return res.status(400).json( {message: error.message} );
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // let users = await User.find();
        const users = await User.find().skip((page - 1) * limit).limit(limit);
        return res.status(200).json(users);
    } catch (error) {
        return res.status(400).json( {message: error.message});
    }
});
app.get('/api/admin/books', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const books = await Book.find().skip((page - 1) * limit).limit(limit);
        return res.status(200).json(books);
    } catch (error) {
        return res.status(400).json( {message: error.message} );
    }
});
app.get('/api/admin/reading', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const readingLogs = await ReadingLog.find().skip((page - 1) * limit).limit(limit);
        return res.status(200).json(readingLogs);
    } catch (error) {
        return res.status(400).json( {message: error.message} );
    }
});


app.post('/api/user/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne( {email} );
        if (!user) {
            return res.status(400).json( {message: "User with that email not found"});
        }
        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            return res.status(400).json( {message: "Incorrect password"} );
        }

        const token = jwt.sign( {userId: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json( {message: "Successful login", token} );
    } catch (error) {
        return res.status(400).json( {message: error.message});
    }
});


// Attempt at file upload?????
app.post('/api/file/upload', authMiddleware, async (req, res) => {
    try {
        const {bookId, bookImageFile} = req.body;
            if (!bookId || !bookImageFile) {
                return res.status(400).json( {message: "Request parameters error"});
            }
            const image_file_path = `/uploads/${req.file.filename}`;

            const book = await Book.findByIdAndUpdate(
                bookId,
                { $set: {coverImage: image_file_path} },
                { new: true }
            );

            if (!book) {
                return res.status(400).json( {message: "Book not found in database"} );
            }
            return res.status(200).json( {message: "Image uploaded and book updated"} );
    } catch (error) {
        return res.status(400).json( {message: error.message} );
    }
})


app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});