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
            const response = await new Product(newProduct).save();
            return response;
        }
        catch(error){
            logger.error(`Error saving product ${error}`);
        }
    }
}