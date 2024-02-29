const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { warehouseServices } = require('../services');
const { warehouseValidators: { create, edit, getAllGoodsIn, AcceptTheGoodsGI } } = require('../validators');
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

/**
 * Route for getting all data of warehouse goods in for dashboard.
 */
router.get(`/gi/getAll`, jwtVerify, validate(getAllGoodsIn), async (req, res) => {
    try {
        const result = await warehouseServices.getAllGoodsIn(req.headers['x-org-type'], req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting all data of warehouse goods in: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting data of warehouse goods in for dashboard by id.
 */
router.get(`/gi/get/:shipmentId`, jwtVerify, async (req, res) => {
    try {
        const result = await warehouseServices.getGoodsInById(req.headers['x-org-type'], req.params.shipmentId);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting data of warehouse goods in by id: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry item shipment by id to accept warehouse goods for Shipment Dispatched
 */
router.post(`gi/accept/:enquiryId/:shipmentId`, jwtVerify, validate(AcceptTheGoodsGI), async (req, res) => {
    try {
        const result = await warehouseServices.AcceptTheGoodsGI(req.params.enquiryId, req.params.shipmentId, req.headers['x-org-type'], req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while while accepting warehouse goods (gi/accept/:enquiryId/:shipmentId): ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});


module.exports = router;