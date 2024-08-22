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
        res.json({item});
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).json({ error: err.message });
    }
}


const removeItem = async (req, res) => {
    // const item = await Stock.findById(req.params.item);
    const item = await Stock.find(req.params.item);
    res.json(item);
}


// export functions within an object
module.exports = { getAllStock, getStockBySupplier, getStockByName, getStockByQuantity, getSimilarStockByName, getQuantity, getSupplier, addItem, removeItem } 