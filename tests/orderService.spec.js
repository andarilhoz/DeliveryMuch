const mongoose = require("mongoose");
const {MongoMemoryServer} = require('mongodb-memory-server');

const { logger } = require('../src/utils/logger');

const {MongoNotConnectedError} = require('mongodb')

const OrderService = require('../src/services/orderService');

const Order = require('../src/models/Order');

let mongoServer;

beforeAll(async () => {
    await ConnectToMongodb();

    logger.silent = true;
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    logger.silent = false;
})


beforeEach( async () => {
    const collections = await mongoose.connection.db.collections()

    for (let collection of collections) {
      await collection.deleteMany({})
    }
});


describe('OrderController CreateOrder Tests', () => {
    it('Should create order with total of 18.01', async () => {
        
        const order = {
            "products": [
                {
                    "name": "Abacaxi",
                    "price": 10.58,
                    "quantity": 1
                },
                {
                    "name" : "Melancia",
                    "price": 7.43,
                    "quantity": 1
                },
            ],
            "total": 18.01
        }

        const createdOrder = await OrderService.createOrder(order);
        const savedOrder = await Order.findById(createdOrder._id);

        expect(savedOrder).not.toBeUndefined();
        expect(savedOrder).not.toBeNull();
    })

    it('Should fail to create order without products', async () => {
        
        const order = {}

        const spy = jest.spyOn(logger, 'error');
        try {
            await OrderService.createOrder(order);
        } catch (error) {
            expect(spy).toHaveBeenCalled();
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError)
        }
    })
})

describe('OrderController GetAllOrders Tests', () => {
    it('Should get all orders', async () => {
        
        const order = {
            "products": [
                {
                    "name": "Abacaxi",
                    "price": 10.58,
                    "quantity": 1
                },
                {
                    "name" : "Melancia",
                    "price": 7.43,
                    "quantity": 1
                }
            ],
            "total": 18.01
        }

        await OrderService.createOrder(order);
        await OrderService.createOrder(order);
        await OrderService.createOrder(order);

        const orders = await OrderService.getAllOrders();

        expect(orders).not.toBeUndefined();
        expect(orders).not.toBeNull();
        expect(orders.length).toBe(3);
    }),

    it('Should fail if mongoose is disconnected', async () => {
        
        mongoose.disconnect();

        const spy = jest.spyOn(logger, 'error');
        try {
            await OrderService.getAllOrders();
        } catch (error) {
            expect(spy).toHaveBeenCalled();
            expect(error).toBeInstanceOf(MongoNotConnectedError)
        }

        await ConnectToMongodb();
    })
})

describe('OrderController GetById Tests', () => {
    it('Should retrieve order by Id', async () => {
        
        const order = {
            "products": [
                {
                    "name": "Abacaxi",
                    "price": 10.58,
                    "quantity": 1
                },
                {
                    "name" : "Melancia",
                    "price": 7.43,
                    "quantity": 1
                }
            ],
            "total": 18.01
        }

        const newOrder = await OrderService.createOrder(order);

        const fetchedOrder = await OrderService.getOrderById(newOrder._id);

        expect(fetchedOrder).not.toBeUndefined();
        expect(fetchedOrder).not.toBeNull();
        expect(fetchedOrder.products.length).toBe(2);
    })

    it('Should fail to fetch unsaved orderId', async () => {

        mongoose.disconnect();

        const spy = jest.spyOn(logger, 'error');
        
        try {
            const fetchedOrder = await OrderService.getOrderById(1);
        } catch (error) {
            expect(spy).toHaveBeenCalled();
            expect(error).toBeInstanceOf(MongoNotConnectedError)
        }
        await ConnectToMongodb();
    })
})

async function ConnectToMongodb(){
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
}