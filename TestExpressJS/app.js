const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const db = new sqlite3.Database('data.db');
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure users table exists before running queries
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);
});

//-------------------- FUNCTIONS ---------------------//

// Get all users
function getAllUsers() {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, username FROM users", [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// Get a single user by ID
function getUserById(id) {
    return new Promise((resolve, reject) => {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) return reject(new Error("Invalid user ID"));

        db.get("SELECT id, username FROM users WHERE id = ?", [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row || null);
        });
    });
}

// Update a user (Full update)
function updateUser(id, username, password) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE users SET username = ?, password = ? WHERE id = ?`,
            [username, password, id],
            function (err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            }
        );
    });
}

// Partially update a user (PATCH)
function patchUser(id, updates) {
    return new Promise((resolve, reject) => {
        let fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        let values = Object.values(updates);
        values.push(id);

        db.run(`UPDATE users SET ${fields} WHERE id = ?`, values, function (err) {
            if (err) return reject(err);
            resolve(this.changes > 0);
        });
    });
}

//-------------------- ROUTES ---------------------//

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/delete', (req, res) => res.sendFile(path.join(__dirname, 'public', 'delete.html')));

// Get all users
app.get("/users", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get a single user by ID
app.get("/users/:id", async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
            if (err) return res.status(400).json({ message: "User already exists" });
            res.status(201).json({ message: "User registered successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ message: "Invalid username or password" });

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });
            res.json({ message: "Login successful" });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    });
});

// Delete a user
app.post('/delete-account', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    db.run(`DELETE FROM users WHERE username = ?`, [username], function (err) {
        if (err || this.changes === 0) return res.status(400).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    });
});

// Full update a user (PUT)
app.put("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const success = await updateUser(id, username, hashedPassword);
        if (!success) return res.status(404).json({ error: "Update unsuccessful" });

        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// Partial update a user (PATCH)
app.patch("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "Update a field" });
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const success = await patchUser(id, updates);
        if (!success) return res.status(404).json({ error: "Update unsuccessful" });

        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

//-------------------- START SERVER ---------------------//

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
