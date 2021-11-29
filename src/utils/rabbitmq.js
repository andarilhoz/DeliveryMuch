const amqp = require('amqplib');
const { logger } = require('./logger');

class RabbitmqServer {
    connection;
    channel;

    async initialize(){
        this.connection = await amqp.connect(process.env.RABBITMQ_URI)
        this.channel = await this.connection.createChannel();
        logger.info("RabbitMQ connection successful")
    }

    async consume(queue, callback){
        return this.channel.consume(queue, (message) => {
            callback(message);
            this.channel.ack(message);
        })
    }
}

module.exports = new RabbitmqServer;