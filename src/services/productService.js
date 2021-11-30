const Product = require("../models/Product");
const { logger } = require("../utils/logger");

module.exports = class ProductService{
    static async createProduct(data){
        try{
            const newProduct = {
                name: data.name,
                quantity: data.quantity,
                price: data.price
            }
            return await new Product(newProduct).save();
        }
        catch(error){
            logger.error(`Error saving product ${error}`);
        }
    }

    static async getProductByName(name){
        try{
            return await Product.findOne({name}, {_id :0, __v:0});
        }catch(err){
            logger.error(`Error getting product ${name}, ${err}`);
            throw err;
        }
    }

    static async updateProduct(name, amount){
        try {
            await Product.findOneAndUpdate({name}, {$inc: {quantity: amount}}).orFail();
        } catch (error) {
            logger.error(`Error updating product ${name}, amount ${amount}`);
            throw error;
        }
    }
}