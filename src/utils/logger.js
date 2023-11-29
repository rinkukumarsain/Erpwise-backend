const winston = require('winston');

// const LOG_ID = 'utils/logger';

//  configure winston logger
const winstonOptions = {
    level: 'info',
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' })
    ],
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `${[info.timestamp]} ${info.level.toUpperCase()} ${info.message}`)
    )
};

const winstonLogger = winston.createLogger(winstonOptions);

// custom logger
exports.logger = {
    /**
     * Create debug logger 
     * 
     * @param {string} id loggin path 
     * @param {string} message log tag
     * @returns {*} log
     */
    debug(id = null, message) {
        winstonLogger.debug(prepareMessage(id, message));
    },
    /**
     * Create info logger 
     * 
     * @param {string} id loggin path 
     * @param {string} message log tag
     * @returns {*} log
     */
    info(id = null, message) {
        winstonLogger.info(prepareMessage(id, message));
    },
    /**
     * Create error logger 
     * 
     * @param {string} id loggin path 
     * @param {string} message log tag
     * @returns {*} log
     */
    error(id = null, message) {
        winstonLogger.error(prepareMessage(id, message));
    },
    prepareId
};


/**
 * Create logger log id
 * 
 * @param {string} logId loggin path 
 * @param {object} req log message
 * @param {string} tag log tag 
 * @returns {string} log complete id
 */
function prepareId(logId = 'PATH_UNKNOWN', req, tag) {
    let result = `[${logId}]`;
    if (tag) result = `${result}|${tag}`;
    if (req && req.id) result = `${result}|${req.id}`;
    return result;
}

/**
 * Create logger message
 * 
 * @param {string} id log id 
 * @param {string} message log message
 * @returns {string} log complete message
 */
function prepareMessage(id, message) {
    return `${prepareId(id)} ${message}`;
}

