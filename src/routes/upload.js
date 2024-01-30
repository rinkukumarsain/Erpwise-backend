const express = require('express');
// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { uploadS3 } = require('../utils/multer');
const { handleResponse, handleErrorResponse } = require('../helpers/response');


const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/upload';

/**
 * Route for creating enquiry so.
 */
router.post('/upload', jwtVerify, uploadS3.single('file'), async (req, res) => {
    try {
        if (req?.file.location) {
            return handleResponse(res, statusCode.OK, {
                success: true,
                message: 'File uploaded successfully.',
                data: req.file.location
            });
        }
        return handleResponse(res, statusCode.BAD_REQUEST, {
            success: false,
            message: 'Error while uploading file.'
        });
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while uploading file: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;