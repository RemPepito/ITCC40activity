const express = require('express');
const app = express();
const path = require('path');  
const sqlite3 = require('sqlite3').verbose();
let sql;

const db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});
sql = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
)`;

db.run("DROP TABLE IF EXISTS users");

app.use(express.static('Public'));

// Main landing page route
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

// Route for Login Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Register.html'));
});

app.get('/delete', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Delete.html'));
});


app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
