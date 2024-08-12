const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const url = process.env.MONGODB_URI;

const db = async () => {
    try {
        const connection = await mongoose.connect(url);
        console.log(`Cluster connected: ${connection.connection.host}`);
        console.log(`Connected to database: ${connection.connection.name}`);
    } catch (error) {
        console.log('Error connecting to database.');
    }
}

module.exports = db;