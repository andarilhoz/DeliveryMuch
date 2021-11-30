const express = require('express');
const app = express();
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/products', productRoutes);
app.use('/orders', orderRoutes);


module.exports = {
    app
}