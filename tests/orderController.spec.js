const mongoose = require("mongoose");
const {MongoMemoryServer} = require('mongodb-memory-server');

const { getMockReq, getMockRes } = require('@jest-mock/express');

const { logger } = require('../src/utils/logger');

const OrderCtrl = require('../src/controllers/orders.controller');

const OrderService = require('../src/services/orderService');
const ProductService = require('../src/services/productService');

const { res, next, mockClear } = getMockRes();

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await ConnectToMongodb();
    const abacaxi = {
        name: "Abacaxi",
        quantity: 1,
        price: 10.58
    }

    const melancia = {
        name: "Melancia",
        quantity: 1,
        price: 7.34
    }

    await ProductService.createProduct(abacaxi);
    await ProductService.createProduct(melancia);

    logger.silent = true;
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    logger.silent = false;
})

beforeEach(() => {
    mockClear();
})


describe('OrderController CreateOrder Tests', () => {
    it('Should Create Order with right total amount', async () => {

        const req = getMockReq({ body: {
            "products": [
                {
                    name: "Abacaxi",
                    quantity: 1
                },
                {
                    name: "Melancia",
                    quantity: 1
                }
            ]
        }})
        
        await OrderCtrl.apiCreateOrder(req, res, next);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                total: 17.92
            })
        )
    }),

    it('Should return fail when products are null', async () => {

        const req = getMockReq({ body: {
        }})
        
        jest.clearAllMocks();
        const spy = jest.spyOn(res, 'status');

        await OrderCtrl.apiCreateOrder(req, res, next);

        expect(spy).toHaveBeenCalledWith(500);
    })


    it('Should return 400 when products quantity arent enough', async () => {

        const req = getMockReq({ body: {
            "products": [
                {
                    name: "Abacaxi",
                    quantity: 10
                },
                {
                    name: "Melancia",
                    quantity: 10
                }
            ]
        }})
        jest.clearAllMocks();
        const spy = jest.spyOn(res, 'sendStatus');

        await OrderCtrl.apiCreateOrder(req, res, next);
        expect(spy).toHaveBeenCalledWith(400);
    })
})


describe('OrderController GetAllOrders Test', () => {
    it('Should return all orders', async () => {

        jest.clearAllMocks();
        const req = getMockReq();
        await OrderCtrl.apiGetAllOrders(req, res, next);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                orders: expect.any(Array)
            })
        )
    })

    it('Should return error when database is offline', async () => {

        jest.clearAllMocks();
        mongoose.disconnect();
        const req = getMockReq();

        const spy = jest.spyOn(res, 'status');
        await OrderCtrl.apiGetAllOrders(req, res, next);
        expect(spy).toHaveBeenCalledWith(500);
        
        await ConnectToMongodb();
    })
})

describe('OrderController GetOrderById Test', () => {
    it('Should return same order from givenId', async () => {

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
        const req = getMockReq({ params: {id: newOrder._id.toString()}})
        
        await OrderCtrl.apiGetOrderById(req, res, next);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: newOrder._id
            })
        )
    })

    it('Should fail when database is offline', async () => {
        jest.clearAllMocks();
        mongoose.disconnect();
        const req = getMockReq({ params: {id: "1"}})
        const spy = jest.spyOn(res, 'status');
        await OrderCtrl.apiGetOrderById(req, res, next);

        expect(spy).toHaveBeenCalledWith(500);
        await ConnectToMongodb();
    })
})

async function ConnectToMongodb(){
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
}