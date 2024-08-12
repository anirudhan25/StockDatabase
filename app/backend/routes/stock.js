const express = require('express');
const router = express.Router();

// controller functions
const { getStockBySupplier, getStockByName, getSimilarStockByName, getQuantity, getSupplier } = require('../controllers/StockController');

// define routes
router.get('/from/:supplier', getStockBySupplier);
router.get('/:item', getStockByName);
router.get('/like/:item', getSimilarStockByName);
router.get('/:item/quantity', getQuantity);
router.get('/:item/supplier', getSupplier);

module.exports = router;