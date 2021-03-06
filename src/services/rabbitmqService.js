const { logger } = require('../utils/logger');
const rabbitmq = require('../utils/rabbitmq');
const ProductService = require('./productService');

module.exports = new class RabbitmqService {

    async initialize(){
        await rabbitmq.initialize();

        await rabbitmq.consume(async message => {
            await this.processMessage(message);
        });
    }

    async processMessage(message){
        await this[message.fields.routingKey](message.content.toString().replaceAll('"',''))
    }

    async incremented(productName){
        logger.info(`Should increment ${productName}`)
        await ProductService.updateProduct(productName, 1)
    }

    async decremented(productName){
        logger.info(`Should decrement ${productName}`)
        let product = await ProductService.getProductByName(productName);
        if(product.quantity <= 0){
            logger.warn(`Zero value stock ${productName}`)
            return;
        }
        await ProductService.updateProduct(productName, -1)
    }
} 