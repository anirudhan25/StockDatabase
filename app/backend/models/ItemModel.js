const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// structure of each item in the database
const itemSchema = new Schema({
    Product: {
        type: String,
        required: true 
    },

    Quantity: {
        type: String,
        required: true 
    },

    Supplier: {
        type: String,
        required: true 
    }
});

module.exports = mongoose.model('Item', itemSchema, 'Stock');
