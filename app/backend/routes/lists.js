const express = require('express');
const router = express.Router();

// controller functions
const { getListByName, getListByID, addList, removeListByName, removeListByID } = require('../controllers/ListController');

// define routes
// route url already starts with '/api/lists'
router.get('/:get/:name', getListByName);
router.get('/:get/:id', getListByID);

router.post('/:add/:name', addList);

router.delete('/delete/:name', removeListByName);
router.delete('/delete/:id', removeListByID);

module.exports = router;