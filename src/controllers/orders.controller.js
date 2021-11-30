const OrderService = require('../services/orderService');
const ProductService = require('../services/productService');

const { logger } = require('../utils/logger');

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
            let id = req.params.id;
            const order = await OrderService.getOrderById(id);
            res.json(order);
        } catch (error) {
            logger.error(error)
            res.status(500).json({error});
        }
    }
    
    static async apiCreateOrder(req, res, next){
        try{
            let receivedOrder = req.body
            
            let productsNameArray = receivedOrder.products.map(product => product.name);
            let requestedProducts = await ProductService.getProductsByNames(productsNameArray);

            //this could be improve to return the mising stock
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