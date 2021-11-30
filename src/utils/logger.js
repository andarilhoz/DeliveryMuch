const {createLogger, format, transports} = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.colorize({ all: true }),
    format.errors({ stack: true }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  defaultMeta: { service: 'DeliveryMuch' }
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.colorize({ all: true }),
        format.errors({ stack: true }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
  }));
}

module.exports = {
    logger
}