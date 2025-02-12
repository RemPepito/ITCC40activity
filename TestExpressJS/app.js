const express = require('express');
const sqlite3 = require('sqlite3').verbose(); 
const bcrypt = require('bcrypt');

const app = express();
const db = new sqlite3.Database('data.db');
const PORT = 3000;

app.use(express.json());

// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)`);

// Register user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ message: "User already exists" });
        }
        res.status(201).json({ message: "User registered successfully" });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        res.json({ message: "Login successful", token });
    });
});

// Delete user
app.delete('/delete', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    db.run(`DELETE FROM users WHERE username = ?`, [username], function(err) {
        if (err || this.changes === 0) {
            return res.status(400).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:3000`);
});
