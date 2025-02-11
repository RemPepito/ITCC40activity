const express = require('express');
const app = express();
const path = require('path');  


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
