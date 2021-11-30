const ProductService = require('../services/productService');
const { logger } = require('../utils/logger');

module.exports = class Product {
    
    static async apiGetProductByName(req, res, next){
        try{
            let name = req.params.name
            const product = await ProductService.getProductByName(name)

            if(product == null){
                res.sendStatus(404);
                return;
            }
            
            res.json(product);
        }catch(err){
            logger.error(err)
            res.status(500).json({error: err});
        }
    }
}