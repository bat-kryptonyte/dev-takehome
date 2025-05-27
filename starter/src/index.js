
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

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

// TODO: Define your route handlers below

// — Level 1 CRUD endpoints —
// POST /api/user       → create a new User
const ObjectID = mongoose.Schema.Types.ObjectId;
const User = new mongoose.model('User', new mongoose.Schema({
    _id: {
        type: ObjectID,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        required: true
    }
}));

app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        newUser.save();
        res.status(200).json({message : "User saved sucessfully."});
    } catch (err) {
        res.status(400).json({error : err.message});
    }
}
);

// POST /api/book       → create a new Book

const Book = new mongoose.model('Book', new mongoose.Schema({
    _id: {
        type: ObjectID,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    ownerID: {
        type: ObjectID,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
    }
}));

app.post('/api/book', async (req, res) => {
    try {
        const newBook = new Book(req.body);
        newBook.save();
        res.status(200).json({message : "Book saved sucessfully."});
    } catch (err) {
        res.status(400).json({error : err.message});
    }
});

// POST /api/reading    → create a new ReadingLog

const ReadingLog = new mongoose.model('ReadingLog', new mongoose.Schema({
    _id: {
        type: ObjectID,
        required: true,
    },
    bookId: {
        type: ObjectID,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
}));

app.post('/api/reading', async (req, res) => {
    try {
        const userBookId = req.body.bookId;
        const userBook = Book.findOne(userBookId);
        if (!userBook.ownerId.equals(userBookId)) {
            res.status(400).json({message : "bookId does not match with ownerId."});
        }
        const newLog = new ReadingLog(req.body);
        newLog.save();
        res.status(200).json({message : "Reading Log saved sucessfully."});
    } catch (err) {
        res.status(400).json({error : err.message});
    }
});

// — Level 2 Admin views —

// GET  /api/admin/users    → list all Users

app.get('/api/admin/users', async (req, res) => {
    try {
        const users = User.find();
        res.status(200).json(users);
    } catch(err) {
        res.status(400).json({error : err.message});
    }
});

// GET  /api/admin/books    → list all Books
app.get('/api/admin/books', async (req, res) => {
    try {
        const books = Book.find();
        res.status(200).json(books);
    } catch(err) {
        res.status(400).json({error : err.message});
    }
});

// GET  /api/admin/reading  → list all ReadingLogs
app.get('/api/admin/reading', async (req, res) => {
    try {
        const logs = ReadingLog.find();
        res.status(200).json(logs);
    } catch(err) {
        res.status(400).json({error : err.message});
    }
});

// — Level 3 Authentication (optional) —
// POST /api/user/login     → authenticate and issue JWT
// (then protect your other routes via middleware)

// You can scaffold each handler like this:

// app.post('/api/user', async (req, res) => { … });
// app.post('/api/book', async (req, res) => { … });
// app.post('/api/reading', async (req, res) => { … });


app.listen(port, () => {
console.log(`🚀 Server running on http://localhost:${port}`);
});