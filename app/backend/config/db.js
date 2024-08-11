const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const url = process.env.MONGODB_URI;

const db = async () => {
    try {
        const connection = await mongoose.connect(url);
        console.log(`Database connected: ${connection.connection.host}`)
    } catch (error) {
        console.log('Error connecting to database.')
    }
}

module.exports = db;