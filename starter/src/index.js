
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


app.listen(port, () => {
console.log(`🚀 Server running on http://localhost:${port}`);
});