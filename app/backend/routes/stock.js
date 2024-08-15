const express = require('express');
const router = express.Router();

// controller functions
const { getStockBySupplier, getStockByName, getStockByQuantity, getSimilarStockByName, getQuantity, getSupplier } = require('../controllers/StockController');

// define routes
router.get('/from/:supplier', getStockBySupplier);
router.get('/stock/:item', getStockByName);
router.get('/quantity/:quantity', getStockByQuantity);
router.get('/like/:item', getSimilarStockByName);
router.get('/:item/quantity', getQuantity);
router.get('/:item/supplier', getSupplier);

module.exports = router;