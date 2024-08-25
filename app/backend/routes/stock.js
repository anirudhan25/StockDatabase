const express = require('express');
const router = express.Router();

// controller functions
const { getAllStock, getStockBySupplier, getStockByName, getStockByQuantity, getSimilarStockByName, getQuantity, getSupplier, addItem, updateDatabase, removeItem, exportExcel, exportPDF } = require('../controllers/StockController');

// define routes
router.get('/from/all', getAllStock);
router.get('/from/:supplier', getStockBySupplier);
router.get('/get/:item', getStockByName);
router.get('/quantity/:quantity', getStockByQuantity);
router.get('/like/:item', getSimilarStockByName);
router.get('/:item/quantity', getQuantity);
router.get('/:item/supplier', getSupplier);
router.post('/add/:item', addItem);
router.post('/update', updateDatabase);
router.delete('/remove/:item', removeItem);
router.post('/export/excel', exportExcel);
router.post('/export/pdf', exportPDF);

module.exports = router;