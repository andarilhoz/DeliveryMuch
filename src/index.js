const { app } = require('./app');
const port = process.env.PORT || 3000;
const  { logger }  = require('./utils/logger');
const db = require('./utils/db');

logger.info("Application initialized")

async function Initialize(){
    await db.connect();

    app.listen(port, () => {
        logger.warn(`App listening on port ${port}`)
    });
}

Initialize();