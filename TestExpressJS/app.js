const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('data.db');
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)`);

// Routes to serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Get all users
app.get('/users', (req, res) => {
    db.all(`SELECT id, username FROM users`, [], (err, users) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching users" });
        }
        res.json(users);
    });
});

// Register user
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function(err) {
        if (err) {
            return res.status(400).json({ message: "User already exists" });
        }
        res.status(201).json({ message: "User registered successfully", username: username });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        res.json({ message: "Login successful", username: user.username });
    });
});

// Update profile
app.post('/update-profile', (req, res) => {
    const { currentUsername, newUsername, newPassword, updateType } = req.body;
    
    // First check if user exists
    db.get(`SELECT * FROM users WHERE username = ?`, [currentUsername], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (updateType === 'username') {
            // Check if new username is already taken
            db.get(`SELECT * FROM users WHERE username = ?`, [newUsername], (err, existingUser) => {
                if (existingUser) {
                    return res.status(400).json({ message: "Username already taken" });
                }

                // Update username
                db.run(`UPDATE users SET username = ? WHERE username = ?`,
                    [newUsername, currentUsername],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ message: "Error updating username" });
                        }
                        res.json({ message: "Profile updated successfully" });
                    });
            });
        } else if (updateType === 'password') {
            // Update password
            db.run(`UPDATE users SET password = ? WHERE username = ?`,
                [newPassword, currentUsername],
                function(err) {
                    if (err) {
                        return res.status(500).json({ message: "Error updating password" });
                    }
                    res.json({ message: "Profile updated successfully" });
                });
        } else {
            res.status(400).json({ message: "Invalid update type" });
        }
    });
});

// Delete user
app.post('/delete-account', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    // First check if user exists
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Delete the user
        db.run(`DELETE FROM users WHERE username = ?`, [username], function(err) {
            if (err) {
                return res.status(500).json({ message: "Error deleting user" });
            }
            res.json({ message: "User deleted successfully" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
