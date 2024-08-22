const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Stock = require('../models/StockModel');

const listSchema = new Schema({
    Name: {
        type: String,
        required: true 
    },
    Products: {
        type: [Stock.schema],
        required: true 
    }
});

module.exports = mongoose.model('List', listSchema, 'Lists');
