const OrderService = require('../services/orderService');
const ProductService = require('../services/productService');

const Product = require('../models/Product');

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
                res.status(404).json({message:"Item Not Found"});
                return;
            }

            const order = await OrderService.getOrderById(id);
            if(order == null){
                res.status(404).json({message:"Item Not Found"});
                return;
            }
            res.json(order);
        } catch (error) {
            logger.error(error)
            res.status(500).json({error});
        }
    }
    
    static async apiCreateOrder(req, res, next){
        const session = await Product.startSession();
        session.startTransaction();

        try{
            let receivedOrder = req.body
            

            let invalidations = []

            if(!receivedOrder.products || receivedOrder.products.length <= 0){
                res.status(400).json({message: "Invalid Products Array"});
                await session.abortTransaction();
                session.endSession();
                return;
            }

            let listOfInvalidValues = receivedOrder.products.filter(product => product.quantity <= 0)

            if(listOfInvalidValues.length > 0){
                res.status(400).json({message: "Invalid Products Quantity", items: listOfInvalidValues});
                await session.abortTransaction();
                session.endSession();
                return;
            }

            let productsNameArray = receivedOrder.products.map(product => product.name);
            let requestedProducts = await ProductService.getProductsByNames(productsNameArray);

            let listOfMissingProducts = Order.missingProducts(requestedProducts, productsNameArray)

            if(listOfMissingProducts.length > 0){
                invalidations.push({message: "Missing Products", items: listOfMissingProducts});
            }

            let outOfStockItems = Order.evaluateStock(requestedProducts, receivedOrder);

            if(outOfStockItems.length > 0){
                invalidations.push({message: "Out of stock", items: outOfStockItems});
            }

            if(invalidations.length > 0){
                res.status(400).json(invalidations);
                await session.abortTransaction();
                session.endSession();
                return;
            }
            
            let { total, productsWithPrice} = Order.evaluatePrice(requestedProducts, receivedOrder);
            
            const newOrder = {
                total,
                products: productsWithPrice
            }
            
            const productsInverseQuantity = receivedOrder.products.map(product => {
                product.quantity *= -1
                return product;
            } )

            const product = await OrderService.createOrder(newOrder);
            await ProductService.updateMultipleProducts(productsInverseQuantity);

            await session.commitTransaction();
            session.endSession();
            
            res.json(product);

        }catch(err){
            await session.abortTransaction();
            session.endSession();
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

            productsWithPrice.push({
                name: requestedProduct.name,
                price: product.price,
                quantity: requestedProduct.quantity
            });
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