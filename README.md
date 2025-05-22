
# 📚 Book Reading Manager 

Welcome! This take-home exercise is designed for developers **new to JavaScript/TypeScript** who want to learn by building a small backend API. No prior JS experience required—just curiosity and willingness to learn.

> **Note:** If anything is unclear, please open a GitHub issue referencing the task number (e.g. “Task 2”).

---

## 🛠 What You’ll Build

A simple REST API to manage:

* **Users**
* **Books**
* **Reading Logs**

You’ll store data in a NoSQL database (e.g. MongoDB Atlas) and write your server in JavaScript or TypeScript.

---

## 🚀 Getting Started

1. **Install Node.js**
   We recommend Node.js v16+. Download from [https://nodejs.org/](https://nodejs.org/).
2. **Clone this repo**

   ```bash
   git clone https://github.com/bat-kryptonyte/dev-takehome.git
   cd dev-takehome
   ```
3. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

   * Fill in your database connection string in `.env`.
4. **Install dependencies**

   ```bash
   npm install
   ```
5. **Start the server**

   ```bash
   npm run start
   ```

   The API will run at `http://localhost:5000`.

---

## 📄 Schemas.md

See `Schemas.md` for definitions of your data models (User, Book, ReadingLog).

---

## 🎯 Tasks

### Level 0: Setup

1. **Database connection**
   * Connect to a free MongoDB Atlas cluster.
   * Test the connection in your server’s startup code.
2. **Health check endpoint**
   * Create **GET** `/api/health`
   * Returns `{ "healthy": true }`

---

### Level 1: CRUD Basics

> For each of these, read JSON from the request body and save it to your DB.

3. **Create User**
   * **POST** `/api/user`
   * Body example:
     ```json
     { "name": "Alice", "email": "alice@example.com" }
     ```
   * Return `200` on success or `400` if fields are missing.
4. **Create Book**
   * **POST** `/api/book`
   * Body example:
     ```json
     { "title": "1984", "author": "George Orwell", "ownerId": "<user-id>" }
     ```
5. **Create Reading Log**
   * **POST** `/api/reading`
   * Body example:
     ```json
     {
       "bookId": "<book-id>",
       "date": "2025-05-22",
       "notes": "Finished chapters 1–3"
     }
     ```

---

### Level 2: Simple Validation & Admin Views

6. **Owner check**
   * In `/api/reading`, verify that the specified `bookId` really belongs to the authenticated `ownerId`.
   * If not, return `400`.
7. **Admin endpoints** (no auth required yet)
   * **GET** `/api/admin/users` → all users
   * **GET** `/api/admin/books` → all books
   * **GET** `/api/admin/reading` → all reading logs
   * **Bonus:** add simple pagination via query params (`?page=1&limit=20`).

---

### Level 3: Authentication (Optional)

8. **Password hashing**
   * Update `/api/user` to accept and hash a `password` (use [bcrypt]).
9. **Login**
   * **POST** `/api/user/login`
   * Accepts `{ email, password }`, returns `200` if valid or `403` otherwise.
10. **JWT protection**
    * Issue a JWT on login (use [jsonwebtoken]).
    * Protect other endpoints by requiring a valid token in `Authorization` header.

---

### Level 4: File Upload (Stretch)

11. **Upload endpoint**
    * **POST** `/api/file/upload`
    * Accept multipart/form-data with a file (e.g. book cover image).
    * Save to any cloud storage (e.g. AWS S3, Firebase Storage).
    * Save the URL back in the corresponding DB document.

---

## 💡 Tips for Beginners

* **Express framework** is a good starting point:

  ```bash
  npm install express body-parser
  ```

  ```js
  // src/index.js
  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
  app.use(bodyParser.json());
  // ... your endpoints here ...
  app.listen(5000, () => console.log('Server running on 5000'));
  ```
* **MongoDB Atlas tutorial** : [https://www.mongodb.com/docs/atlas/getting-started/](https://www.mongodb.com/docs/atlas/getting-started/)
* **Handling errors** : Always wrap DB calls in `try/catch` and return appropriate HTTP status codes.

---

## 📤 Submitting Your Work

1. Commit all your changes to GitHub.
2. Share the repository link in your application.
3. We’ll review your code, comments, and commit history— **we care more about clarity than completeness** .

Good luck, and happy coding! 📖🚀
