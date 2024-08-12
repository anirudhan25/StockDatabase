require('dotenv').config();
const express = require('express');
const { PagePromise } = require('openai/core');
const db =  require('./config/db')
const app = express();
const port = 8000;
db();

// import routes
const itemRoutes = require('./routes/item');

// register routes
app.use('/api/item', itemRoutes)

app.listen(port, () => {
    console.log(`Server hosted on https://localhost/${port}`);
});


// examples
app.get('/', (req, res) => {
    res.send("Home page.");
});

app.get('/dashboard', (req, res) => {
    res.send("Dashboard page.");
});