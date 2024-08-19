require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PagePromise } = require('openai/core');
const db =  require('./config/db')
const app = express();
const port = 8000;
db();

// middleware
app.use(cors({
  origin: 'http://localhost:5174'
}));
app.use(express.json());

// import routes
const stockRoutes = require('./routes/stock');

// register routes
app.use('/api/stock', stockRoutes)

app.listen(port, () => {
    console.log(`Server hosted on http://localhost:${port}`);
});