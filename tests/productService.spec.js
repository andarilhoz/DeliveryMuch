const mongoose = require("mongoose");
const {MongoMemoryServer} = require('mongodb-memory-server');

const {MongoNotConnectedError} = require('mongodb')

const ProductService = require('../src/services/ProductService');
const Product = require("../src/models/Product");
const { logger } = require('../src/utils/logger');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri)
    logger.silent = true;
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    logger.silent = false;
})

describe('ProductService Creation Tests', () => {
    it('Should create abacaxi product', async () => {

        const abacaxi = {
            name: "Abacaxi",
            quantity: 0,
            price: 10.58
        }

        await ProductService.createProduct(abacaxi);
        const abacaxiProduct = await Product.findOne({name: 'Abacaxi'})
        expect(abacaxiProduct).not.toBeNull()
        expect(abacaxiProduct).not.toBeUndefined();
    })

    it('Should not create abacaxi dup product', async () => {

        const abacaxi = {
            name: "Abacaxi",
            quantity: 0,
            price: 10.58
        }
        jest.clearAllMocks();
        const spy = jest.spyOn(logger, 'error');
        await ProductService.createProduct(abacaxi);
        expect(spy).toHaveBeenCalled();
    })
})


describe('ProductService Update Tests', () => {
    it('Should update abacaxi product with 1 quantity', async () => {

        const abacaxi = {
            name: "Abacaxi",
            quantity: 0,
            price: 10.58
        }

        await ProductService.updateProduct('Abacaxi', 1);
        const abacaxiProduct = await Product.findOne({name: 'Abacaxi'});

        expect(abacaxiProduct).not.toBeUndefined();
        expect(abacaxiProduct).not.toBeNull();
        expect(abacaxiProduct.quantity).toBe(1);
    })

    it('Should log error when trying to update missing produc', async () => {
        jest.clearAllMocks();
        const spy = jest.spyOn(logger, 'error');

        try{
            const updateFunction = await ProductService.updateProduct('Melancia', 1);
        }catch(error){
            expect(spy).toHaveBeenCalled();
            expect(error).toBeInstanceOf(mongoose.Error.DocumentNotFoundError)
        }
    })

    it('Should return Abacaxi get by name', async () => {
        const abacaxiProduct = await ProductService.getProductByName("Abacaxi");
        expect(abacaxiProduct).not.toBeUndefined();
        expect(abacaxiProduct).not.toBeNull();
        expect(abacaxiProduct.price).toBe(10.58);
    })

    it('Should fail when database is disconnected', async () => {
        jest.clearAllMocks();
        const spy = jest.spyOn(logger, 'error');
        mongoose.disconnect();
        try{
            const nullProduct = await ProductService.getProductByName(null);
        }catch(error){
            expect(spy).toHaveBeenCalled();
            expect(error).toBeInstanceOf(MongoNotConnectedError)
        }
    })
})