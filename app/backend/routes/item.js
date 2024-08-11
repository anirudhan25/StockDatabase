const express = require('express');
const router = express.Router();

// controller functions
const {getItem} = require('../controllers/ItemController');

// define routes
router.get('/get', getItem)

module.exports = router;