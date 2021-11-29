const mongoose = require("mongoose");
const  { logger }  = require('./logger');

async function connect() {

    await mongoose.connect(process.env.MONGO_URI, {
        dbName: 'shop',
        serverSelectionTimeoutMS: 5000,
    })
    .then(res => logger.info(`MongoDB connection successful`))
    .catch(err => {
        logger.error(`Error in DB connection ${err}`)
        throw new Error(err);
    })
}

module.exports = { connect };