const express = require('express');
const router = express.Router();

// controller functions
const { getStockBySupplier, getStockByName, getStockByQuantity, getSimilarStockByName, getQuantity, getSupplier, addItem, removeItem } = require('../controllers/StockController');

// define routes
router.get('/from/:supplier', getStockBySupplier);
router.get('/stock/:item', getStockByName);
router.get('/quantity/:quantity', getStockByQuantity);
router.get('/like/:item', getSimilarStockByName);
router.get('/:item/quantity', getQuantity);
router.get('/:item/supplier', getSupplier);
router.post('/add/:item_id', getSupplier);
router.delete('/remove/:item_id', getSupplier);

module.exports = router;