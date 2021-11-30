const Order = require("../models/Order");
const { logger } = require("../utils/logger");

module.exports = class ProductService{

    static async createOrder(order){
        try {
//let total = parseFloat(order.products.reduce((total, current) => total + current.price, 0).toFixed(2));
            let newOrder = {
                products: order.products,
                total : order.total
            }

            return await new Order(newOrder).save();
        } catch (error) {
            logger.error(`Error creating new order ${error}`)
            throw error;
        }
    }

    static async getAllOrders(){
        try {
            return await Order.find();
        } catch (error) {
            logger.error(`Error creating new order ${error}`)
            throw error;
        }
    }

    static async getOrderById(orderId){
        try {
            return await Order.findById({_id: orderId});
        } catch (error) {
            logger.error(`Order not found ${error}`)
        }
    }
}