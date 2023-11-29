const express = require('express');
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const router = express.Router();
const { handleResponse, handleErrorResponse } = require('../helpers/response');


const LOG_ID = 'routes/heartBeat';


router.get('/heartbeat', async (req, res) => {
    try {
        logger.info(LOG_ID, `heartBeat triggered ...`);
        const response = { message: '💗 Project Working fine !! '};
        handleResponse(res, statusCode.OK, response);
    } catch (err) {
        logger.error(LOG_ID, `Error Occured while getting data from heartbeat: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});


module.exports = router;