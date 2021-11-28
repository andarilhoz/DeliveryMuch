const { app } = require('./app');
const port = process.env.PORT || 3000;
const  { logger }  = require('./utils/logger');

logger.info("Application initialized")

app.listen(port, () => {
    logger.warn(`App listening on port ${port}`)
})