const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// structure of each list of items in the database
const listSchema = new Schema({
    Name: {
        type: String,
        required: true 
    },
    Products: {
        type: String,
        required: true 
    }
});

module.exports = mongoose.model('List', listSchema, 'Lists');
