const { app } = require('./app');

const dotenv = require('dotenv')
dotenv.config();

const port = process.env.PORT || 3000;
const  { logger }  = require('./utils/logger');
const db = require('./utils/db');

const rabbitmq = require('./utils/rabbitmq');

logger.info("Application initialized")

async function Initialize(){
    await db.connect();
    await rabbitmq.initialize();

    app.listen(port, () => {
        logger.warn(`App listening on port ${port}`)
    });
}

Initialize();