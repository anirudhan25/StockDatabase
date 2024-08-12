const Item = require('../models/ItemModel');

// get item 
const getItem = async (req, res) => {
    console.log('getting item...')  // for testing 
    try {
        // querying the database for items with Supplier "Reynolds"
        const items = await Item.find({ Supplier: 'Reynolds' });

        // sending back the found items as a response
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// export functions within an object
module.exports = { getItem } 