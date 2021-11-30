const mongoose = require("mongoose");
const {MongoMemoryServer} = require('mongodb-memory-server');

const { getMockReq, getMockRes } = require('@jest-mock/express');

const { logger } = require('../src/utils/logger');

const ProductCtrl = require('../src/controllers/products.controller');

const ProductService = require('../src/services/productService');

const { res, next, mockClear } = getMockRes();

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const abacaxi = {
        name: "Abacaxi",
        quantity: 0,
        price: 10.58
    }

    await ProductService.createProduct(abacaxi);

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


describe('ProductController GetByName Tests', () => {
    it('Should return product Abacaxi', async () => {

        const req = getMockReq({ params: {name: 'Abacaxi'}})
        
        await ProductCtrl.apiGetProductByName(req, res, next);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Abacaxi'
            })
        )
    })

    it('Should return 404 when product is missing', async () => {
        const req = getMockReq({ params: {name: 'Melancia'}})
        jest.clearAllMocks();
        const spy = jest.spyOn(res, 'sendStatus');

        await ProductCtrl.apiGetProductByName(req, res, next);

        expect(spy).toHaveBeenCalledWith(404);
    })


    it('Should return 500 when error', async () => {
        jest.clearAllMocks();
        const spy = jest.spyOn(res, 'status');

        await ProductCtrl.apiGetProductByName(null, res, next);

        expect(spy).toHaveBeenCalledWith(500);
    })
})