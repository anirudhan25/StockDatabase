require('dotenv').config();
const express = require('express');
const { PagePromise } = require('openai/core');
const db =  require('./config/db')
const app = express();
const port = 8000;
db();

// import routes
const stockRoutes = require('./routes/stock');

// register routes
app.use('/api/stock', stockRoutes)

app.listen(port, () => {
    console.log(`Server hosted on http://localhost/${port}`);
});


// examples
app.get('/', (req, res) => {
    res.send("Home page.");
});

app.get('/dashboard', (req, res) => {
    res.send("Dashboard page.");
});