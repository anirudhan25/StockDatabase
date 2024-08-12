const express = require('express');
const router = express.Router();

// controller functions
const {getItem} = require('../controllers/StockController');

// define routes
router.get('/get', getItem)

module.exports = router;