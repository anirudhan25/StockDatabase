const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// structure of each item in the database
const stockSchema = new Schema({
    Product: {
        type: String,
        required: true 
    },

    Quantity: {
        type: String,
        required: false 
    },

    Supplier: {
        type: String,
        required: true 
    }
});

module.exports = mongoose.model('Stock', stockSchema, 'Stock');
