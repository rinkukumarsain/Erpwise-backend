const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { warehouseServices } = require('../services');
const { warehouseValidators: { create, edit } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/warehouse';

/**
 * Route for creating warehouse.
 */
router.post('/create', jwtVerify, validate(create), async (req, res) => {
    try {
        const result = await warehouseServices.create(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during warehouse/create : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all agent.
 */
router.get('/getAll', jwtVerify, async (req, res) => {
    try {
        const result = await warehouseServices.getAll(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during warehouse/getAll : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for edit warehouse by id.
 */
router.post('/update/:id', jwtVerify, validate(edit), async (req, res) => {
    try {
        const result = await warehouseServices.edit(req.params.id, req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during warehouse/edit : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting warehouse by id.
 */
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await warehouseServices.delete(req.params.id, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during warehouse/delete : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});


module.exports = router;