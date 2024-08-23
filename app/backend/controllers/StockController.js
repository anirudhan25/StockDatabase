const mongoose = require('mongoose');
const Stock = require('../models/StockModel');

const getAllStock = async (req, res) => {
    try {
        const items = await Stock.find({});

        // sending back the found items as a response
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getStockBySupplier = async (req, res) => {
    try {
        // querying the database for items from specified Supplier
        const items = await Stock.find({ Supplier: req.params.supplier });

        // sending back the found items as a response
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getStockByName = async (req, res) => {
    try {
        const items = await Stock.find({ Product: req.params.item });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getStockByQuantity = async (req, res) => {
    try {
        // gets items of similar quantity (e.g. 30g, 10x30g, 30Gx5)
        const items = await Stock.find({ Quantity: { $regex: req.params.quantity, $options: 'i' } });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getSimilarStockByName = async (req, res) => {
    try {
        const items = await Stock.find({ Product: { $regex: req.params.item, $options: 'i' } });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getQuantity = async (req, res) => {
    try {
        const items = await Stock.find({ Product: req.params.item });
        quantities = items.map(item => item = item.Quantity);

        res.json(quantities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getSupplier = async (req, res) => {
    try {
        const items = await Stock.find({ Product: req.params.item });
        suppliers = items.map(item => item = item.Supplier);

        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const addItem = async (req, res) => {
    try {
        console.log("adding item");

        // destructure body
        const { Product, Quantity, Supplier } = req.body;

        // create a new instance of Stock model
        const item = new Stock({ Product, Quantity, Supplier });

        // save the new item to the database
        await item.save();

        // respond with the created item
        res.status(201).json({ item });
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).json({ error: err.message });
    }
}

const updateDatabase = async (req, res) => {
    try {
        console.log("Updating database...");

        const { toAdd, toRemove } = req.body;
        const itemsToAdd = toAdd.flat();
        const itemsToRemove = toRemove.flat();

        // insert new items first
        if (itemsToAdd.length > 0) {
            await Stock.insertMany(itemsToAdd);
        }

        // separate IDs into normal strings and ObjectId
        const idsToRemove = itemsToRemove.map(item => item._id || item.id);
        
        const objectIds = idsToRemove.filter(id => mongoose.Types.ObjectId.isValid(id));
        const stringIds = idsToRemove.filter(id => !mongoose.Types.ObjectId.isValid(id));

        console.log("Items to add", itemsToAdd);
        console.log("Items to remove:", itemsToRemove);
        console.log("IDs to remove:", idsToRemove);
        console.log("ObjectIDs to remove:", objectIds);
        console.log("String IDs to remove:", stringIds);

        // delete by `id` for normal string IDs
        if (stringIds.length > 0) {
            await Stock.deleteMany({ id: { $in: stringIds } });
        }

        // delete by `_id` for ObjectId
        if (objectIds.length > 0) {
            await Stock.deleteMany({ _id: { $in: objectIds } });
        }

        res.status(201).json('Database updated.');
    } catch (err) {
        console.error("Error updating database:", err);
        res.status(500).json({ error: err.message });
    }
};



const removeItem = async (req, res) => {
    try {
        const itemName = req.params.item;
        const item = await Stock.findOneAndDelete({ Product: itemName });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        console.log("Deleted item:", item);
        res.json(item);
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ error: err.message });
    }
};



// export functions within an object
module.exports = { getAllStock, getStockBySupplier, getStockByName, getStockByQuantity, getSimilarStockByName, getQuantity, getSupplier, addItem, updateDatabase,removeItem } 