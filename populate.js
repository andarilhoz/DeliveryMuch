const  { logger }  = require('./src/utils/logger');
const db = require('./src/utils/db');
const dotenv = require('dotenv');

const csv = require('csv-parser')
const fs = require('fs')

const ProductService = require('./src/services/ProductService');

dotenv.config();


async function PopulateDatabase(){
    logger.info("Populated started")

    await db.connect();
    const csvData = await ReadCsv();

    for (const product of csvData) {
        await ProductService.createProduct(product);
    }

    //https://github.com/nodejs/node/issues/15439
    process.exit(0);
}


async function ReadCsv(){
    return new Promise((resolve, reject) => {
        const results = [];

        const stream = fs.createReadStream('products.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('error', err => {
            reject(err);
        })
        .on('end', () => {
            resolve(results);
        })
    })
}

PopulateDatabase();

