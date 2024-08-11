const express = require('express');
const app = express();
const port = 8000;

app.listen(port, () => {
    console.log("server hosted on port ", port);
});


app.get('/', (req, res) => {
    res.send("Home page.");
});

app.get('/dashboard', (req, res) => {
    res.send("Dashboard page.");
});