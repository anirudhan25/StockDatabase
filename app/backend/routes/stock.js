const express = require('express');
const router = express.Router();

// controller functions
const { getAllStock, getStockBySupplier, getStockByName, getStockByQuantity, getSimilarStockByName, getQuantity, getSupplier, addItem, removeItem } = require('../controllers/StockController');

// define routes
router.get('/get/all', getAllStock);
router.get('/from/:supplier', getStockBySupplier);
router.get('/get/:item', getStockByName);
router.get('/quantity/:quantity', getStockByQuantity);
router.get('/like/:item', getSimilarStockByName);
router.get('/:item/quantity', getQuantity);
router.get('/:item/supplier', getSupplier);
router.post('/add/:item', getSupplier);
router.delete('/remove/:item', getSupplier);

module.exports = router;