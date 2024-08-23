const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
// const uri = process.env.MONGODB_URI;
const uri = 'mongodb+srv://anirudhan:3eSxuhvtt6Tlq0Is@stockdatabase.mynsy.mongodb.net/StockDB';

const db = async () => {
    try {
        console.log(uri);
        const connection = await mongoose.connect(uri);
        console.log(`Cluster connected: ${connection.connection.host}`);
        console.log(`Connected to database: ${connection.connection.name}`);
    } catch (error) {
        console.log(`Error connecting to database: \n${error}`);
    }
}

module.exports = db;