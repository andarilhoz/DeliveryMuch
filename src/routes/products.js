const express = require('express');
const { logger } = require('../utils/logger');
const router = express.Router();
const ProductCtrl = require('../controllers/products.controller');

router.get('/:name', ProductCtrl.apiGetProductByName);

module.exports = router;