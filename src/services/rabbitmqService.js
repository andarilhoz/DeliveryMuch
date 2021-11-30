const { logger } = require('../utils/logger');
const rabbitmq = require('../utils/rabbitmq');
const ProductService = require('./productService');

module.exports = new class RabbitmqService {

    async initialize(){
        await rabbitmq.initialize();

        await rabbitmq.consume(message => {
            this.processMessage(message);
        });
    }

    async processMessage(message){
        this[message.fields.routingKey](message.content.toString().replaceAll('"',''))
    }

    async incremented(productName){
        logger.info(`Should increment ${productName}`)
        ProductService.updateProduct(productName, 1)
    }

    async decremented(productName){
        logger.info(`Should decrement ${productName}`)
        let product = await ProductService.getProductsByNames(productName);
        if(product.quantity <= 0)
            return;
        ProductService.updateProduct(productName, -1)
    }
} 