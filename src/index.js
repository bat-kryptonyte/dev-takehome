
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = '3c6a5e049d37b62c45a32b46d2cca08f5658d71a47056fb6aa7a444d86caba4275afe764507efaf0eb2084bdf525750004e89fefd661256d3b0124faef29570c6dacfc67117252954d90f2902042b654f576d0f437bde274e71865841b64a7fb1a01a094635add1c6b94bd530bb1161b1f856c98e97cfd7cf311b220dafc62f8e9f2a8d98a86d89750c31f8333c487f3c7097066b5c215be3deba92ecc4121fff2f0706ce20d4591ead5be2bfb4da8ae29ff2fbcb4170bdc949c350b76578c34559e607fc1fcac6689187f350d01b7d9edb75a573e64398b6b3befd6f0638f60348e2de990c44690a37819abd09bf0eadb45774b4737c85c96b96d625ef22469'

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
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.post('/api/user', async (req, res) => {
    if (!req.body.name || !req.body.email) {
        res.status(400).json({ message: 'Must enter a name and an email' });
    }

    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            createdAt: new Date()
        });
        res.status(200).json({ user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST /api/book       → create a new Book
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

app.post('/api/book', async (req, res) => {
    if (!req.body.title || !req.body.author || !req.body.ownerId) {
        res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const newBook = await Book.create({
            title: req.body.title,
            author: req.body.author,
            ownerId: req.body.ownerId,
            createdAt: new Date()
        });
        res.status(200).json({ book: newBook });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST /api/reading    → create a new ReadingLog
const logSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: Date, required: true },
    notes: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

app.post('/api/reading', async (req, res) => {
    if (!req.body.bookId || !req.body.date || !req.body.notes || !req.body.userId) {
        res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const existingBook = await Book.findById(req.body.bookId);
        if (!existingBook || existingBook.ownerId.toString() !== req.body.userId) {
            return res.status(400).json({ message: 'User does not own this book' });
        }

        const newLog = await Log.create({
            bookId: req.body.bookId,
            date: req.body.date,
            notes: req.body.notes,
            createdAt: new Date()
        });
        res.status(200).json({ log: newLog });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// — Level 2 Admin views —
// GET  /api/admin/users    → list all Users
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET  /api/admin/books    → list all Books
app.get('/api/admin/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json({ books });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET  /api/admin/reading  → list all ReadingLogs
app.get('/api/admin/reading', async (req, res) => {
    try {
        const readingLogs = await Log.find();
        res.status(200).json({ readingLogs });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// — Level 3 Authentication (optional) —
// POST /api/user/login     → authenticate and issue JWT
app.post('/api/user/login', async (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(403).json({ message: 'Invalid email or password' });
        }
        
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { _id: user._id, email: user.email },
            jwtSecret,
            { expiresIn: '1h' }
        )
        return res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
         }
});

// (then protect your other routes via middleware)

// You can scaffold each handler like this:

// app.post('/api/user', async (req, res) => { … });
// app.post('/api/book', async (req, res) => { … });
// app.post('/api/reading', async (req, res) => { … });


app.listen(port, () => {
console.log(`🚀 Server running on http://localhost:${port}`);
});