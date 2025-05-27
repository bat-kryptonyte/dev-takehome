const mongoose = require('mongoose');

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  createdAt: { type: Date, required: true }
});
const User = mongoose.model('User', userSchema);


// Book schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, required: true },
  coverImage: { type: String }
});
const Book = mongoose.model('Book', bookSchema);


// ReadingLog schema
const readingLogSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: Date, required: true },
  notes: { type: String, required: true },
  createdAt: { type: Date, required: true }
});
const ReadingLog = mongoose.model('ReadingLog', readingLogSchema);


// Export all models
module.exports = {User, Book, ReadingLog};
