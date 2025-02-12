import express from 'express';
import { getUsers, getUser, createUser, updateUser, patchUser } from './database.js';

const app = express();
app.use(express.json());

// GET ALL USERS
app.get("/users", async (req, res) => {
    try {
        const users = await getUsers();
        res.send(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// GET ONE USER
app.get("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await getUser(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// CREATE A USER
app.post("/users", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        const userId = await createUser(username, password);
        res.status(201).json({ id: userId, username, password });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// FULL UPDATE A USER (PUT)
app.put("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const success = await updateUser(id, username, password);
        if (!success) {
            return res.status(404).json({ error: "Update unsuccessful" });
        }

        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// PARTIAL UPDATE A USER (PATCH)
app.patch("/users/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "Update a field" });
        }

        const success = await patchUser(id, updates);
        if (!success) {
            return res.status(404).json({ error: "Update unsuccessful" });
        }

        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
});

// Start the server
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
