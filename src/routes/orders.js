const express = require('express');
const { logger } = require('../utils/logger');
const router = express.Router();
const OrderCtrl = require('../controllers/orders.controller');

router.post('/', OrderCtrl.apiCreateOrder);
router.get('/', OrderCtrl.apiGetAllOrders);
router.get('/:id', OrderCtrl.apiGetOrderById);

module.exports = router;