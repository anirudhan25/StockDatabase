const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// structure of each item in the database
const stockSchema = new Schema({
    Product: {
        type: String,
        required: false 
    },

    Quantity: {
        type: String,
        required: false 
    },

    Supplier: {
        type: String,
        required: false 
    },

    Frozen: {
        type: String,
        required: false 
    },

    /* used to identify newly added items to delete / unique identifier*/
    id: {
        type: String,
        required: false 
    },

    selected: {
        type: Boolean,
        required: false 
    }
});

module.exports = mongoose.model('Stock', stockSchema, 'Stock');
