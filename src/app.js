const express = require('express');
const app = express();
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/order');

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = {
    app
}