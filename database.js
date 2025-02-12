import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '4G0NF4DEJDJ',
    database: 'itcc40',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// GET ALL USERS
export async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
}

// GET ONE USER
export async function getUser(userid) {
    const [rows] = await pool.query("SELECT * FROM users WHERE userid = ?", [userid]);
    return rows.length > 0 ? rows[0] : null;
}

// CREATE A USER
export async function createUser(username, password) {
    const [result] = await pool.query(
        "INSERT INTO users (username, password) VALUES (?, ?)", 
        [username, password]
    );
    return { id: result.insertId, username, password };
}

// UPDATE A USER (Full update with PUT)
export async function updateUser(userid, username, password) {
    const [result] = await pool.query(
        "UPDATE users SET username = ?, password = ? WHERE userid = ?",
        [username, password, userid]
    );
    return result.affectedRows > 0; // Returns true if the update was successful
}

// PARTIAL UPDATE A USER (Patch)
export async function patchUser(userid, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return false; // No fields to update

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const query = `UPDATE users SET ${setClause} WHERE userid = ?`;

    values.push(userid); // Add user ID to the values array

    const [result] = await pool.query(query, values);
    return result.affectedRows > 0; // Returns true if the update was successful
}
