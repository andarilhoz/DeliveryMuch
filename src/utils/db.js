const mongoose = require("mongoose");
const  { logger }  = require('./logger');

async function connect() {
    await mongoose.connect(process.env.MONGO_URI)
    .then(res => logger.info(`Connection Successful ${res}`))
    .catch(err => {
        logger.error(`Error in DB connection ${err}`)
        throw new Error(err);
    })
}

module.exports = { connect };