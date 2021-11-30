const Order = require("../models/Order");
const { logger } = require("../utils/logger");

module.exports = class ProductService{

    static async createOrder(order){
        try {
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
            return await Order.find({},{__v: 0});
        } catch (error) {
            logger.error(`Error creating new order ${error}`);
            throw error;
        }
    }

    static async getOrderById(orderId){
        try {
            return await Order.findById(orderId);
        } catch (error) {
            logger.error(`Order not found ${error}`);
            throw error;
        }
    }
}