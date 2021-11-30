const mongoose = require("mongoose");
const {MongoMemoryServer} = require('mongodb-memory-server');

const {MongoNotConnectedError} = require('mongodb')

const ProductService = require('../src/services/productService');
const Product = require("../src/models/Product");
const { logger } = require('../src/utils/logger');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await ConnectToMongodb();
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

        const kiwi = {
            name: "Kiwi",
            quantity: 0,
            price: 1.58
        }

        await ProductService.createProduct(abacaxi);
        await ProductService.createProduct(kiwi);
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
})

describe('ProductService GetByName Tests', () => {

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
        await ConnectToMongodb();
    })
})


describe('ProductService GetByNames FetchList Tests', () => {
    it('Should return Abacaxi and Melancia get by nameArray', async () => {
        const productsList = await ProductService.getProductsByNames(["Abacaxi", "Kiwi"]);
        expect(productsList).not.toBeUndefined();
        expect(productsList).not.toBeNull();
        expect(productsList.length).toBe(2);
    })

    it('Should fail when database is disconnected', async () => {
        jest.clearAllMocks();
        const spy = jest.spyOn(logger, 'error');
        mongoose.disconnect();
        try{
            const nullProduct = await ProductService.getProductsByNames(null);
        }catch(error){
            expect(spy).toHaveBeenCalled();
            expect(error).toBeInstanceOf(MongoNotConnectedError)
        }
        await ConnectToMongodb();
    })
})

async function ConnectToMongodb(){
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
}