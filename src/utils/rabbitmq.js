const amqp = require('amqplib');
const { logger } = require('./logger');

class RabbitmqServer {
    connection;
    channel;

    exchangeName  = "stock";
    queueName = "shop";

    async initialize(){
        logger.info(process.env.RABBITMQ_URI)
        this.connection = await amqp.connect(process.env.RABBITMQ_URI)
        .catch(err => {
            logger.error(`Error connecting to RabbitMQ ${err}`)
            throw new Error(err);
        });

        await this.configureChannel();
        
        logger.info("RabbitMQ connection successful")
    }

    async configureChannel(){
        this.channel = await this.connection.createChannel();

        this.channel.assertExchange(this.exchangeName, 'direct', {durable: true})
        this.channel.assertQueue(this.queueName, {durable: true});

        this.channel.bindQueue(this.queueName, this.exchangeName, 'incremented');
        this.channel.bindQueue(this.queueName, this.exchangeName, 'decremented');
    }

    async consume(callback){
        return this.channel.consume(this.queueName, (message) => {
            callback(message);
            this.channel.ack(message);
        })
    }
}

module.exports = new RabbitmqServer;