// global import
require('pkginfo')(module, 'name', 'version');
require('dotenv').config();
const pkgInfo = module.exports;

// local import
const { logger } = require('../utils/logger');
const { app } = require('./app');



const port = process.env.PORT || 5050;
const LOG_ID = 'server/index';

/**
 * Main program
 * 
 * @returns {boolean} success status
 */
const start = async () => {
    try {
        logger.info(LOG_ID, `~~~ ${pkgInfo.name} v${pkgInfo.version} ~~~`);
        let isConnected = false;
        app.listen(port, (err) => {
            if (err) logger.error(LOG_ID, err);
            isConnected = true;
            logger.info(LOG_ID, `🌷 ${pkgInfo.name} src/index.js, version ${pkgInfo.version}, listening on port ${port}!`);
            return isConnected;
        });
    } catch (error) {
        logger.error(LOG_ID, error);
    }
};

start();
