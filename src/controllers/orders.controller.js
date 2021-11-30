const OrderService = require('../services/orderService');
const ProductService = require('../services/productService');

const { ObjectId } = require("mongodb");

const { logger } = require('../utils/logger');
const { isValidObjectId } = require('mongoose');

module.exports = class Order {

    static async apiGetAllOrders(req, res, next){
        try {
            let orders = await OrderService.getAllOrders();
            let response = {
                orders
            }
            res.json(response);
        } catch (error) {
            logger.error(error)
            res.status(500).json({error});
        }
    }

    static async apiGetOrderById(req, res, next){
        try {
            let id = req.params.id || {};
            
            if(!isValidObjectId(id)){
                res.sendStatus(404);
                return;
            }

            const order = await OrderService.getOrderById(id);
            if(order == null){
                res.sendStatus(404);
                return;
            }
            res.json(order);
        } catch (error) {
            logger.error(error)
            res.status(500).json({error});
        }
    }
    
    static async apiCreateOrder(req, res, next){
        try{
            let receivedOrder = req.body
            
            if(!receivedOrder.products || receivedOrder.products.length <= 0){
                res.sendStatus(400);
                return;
            }

            let productsNameArray = receivedOrder.products.map(product => product.name);
            let requestedProducts = await ProductService.getProductsByNames(productsNameArray);

            //this could be improved to return the list of missing products
            let listOfMissingProducts = Order.missingProducts(requestedProducts, productsNameArray)

            if(listOfMissingProducts.length > 0){
                res.sendStatus(400);
                return;
            }

            //this could be improved to return the mising stock
            let outOfStockItems = Order.evaluateStock(requestedProducts, receivedOrder);

            if(outOfStockItems.length > 0){
                res.sendStatus(400);
                return;
            }
            
            let { total, productsWithPrice} = Order.evaluatePrice(requestedProducts, receivedOrder);
            
            const newOrder = {
                total,
                products: productsWithPrice
            }

            const product = await OrderService.createOrder(newOrder)
            
            res.json(product);
        }catch(err){
            logger.error(err)
            res.status(500).json({error: err});
        }
    }

    static missingProducts(requestedProducts, productsNameArray){
        let missingProducts = [];
        for (const productName of productsNameArray) {
            let hasProduct = requestedProducts.some(product => product.name == productName);
            if(!hasProduct)
                missingProducts.push(productName)
        }
        return missingProducts;
    }

    static evaluatePrice(requestedProducts, receivedOrder ){
        let total = 0;
        let productsWithPrice = [];

        for (const product of requestedProducts) {
            let requestedProduct =  receivedOrder.products.find(receivedProduct => product.name == receivedProduct.name);
            
            total += requestedProduct.quantity * product.price;
            requestedProduct.price = product.price;
            productsWithPrice.push(requestedProduct);
        }

        total = parseFloat(total.toFixed(2));

        return {
            total,
            productsWithPrice
        }
    }

    static evaluateStock(requestedProducts, receivedOrder){
        let lowerQuantity = [];

        for (const product of requestedProducts) {
            let requestedProduct = receivedOrder.products.find(receivedProduct => product.name == receivedProduct.name);
            
            if(product.quantity < requestedProduct.quantity){
                lowerQuantity.push({current: product, requested: requestedProduct})
            }
        }

        return lowerQuantity;
    }
}