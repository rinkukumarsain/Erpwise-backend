const express = require('express');

const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();
const { organisationService } = require('../services');

const LOG_ID = 'routes/prganisationAddress';

/**
 * Route for get all organisation.
 */
router.get('/getAll', jwtVerify, async (req, res) => {
    try {
        const result = await organisationService.getAllOrganisations(req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation/getAll: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for get organisation by id.
 */
router.get('/getById/:id', jwtVerify, async (req, res) => {
    try {
        const result = await organisationService.getOrganisationById(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation/getById: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for creating organisation.
 */
router.post('/create', authorizeRoleAccess, jwtVerify, async (req, res) => {
    try {
        const result = await organisationService.createOrganisation(req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation/create: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for updating the organisation.
 */
router.post('/update/:id', authorizeRoleAccess, jwtVerify, async (req, res) => {
    try {
        const result = await organisationService.update(req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation/update: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for updating the organisation address.
 */
router.post('/update/:id', authorizeRoleAccess, jwtVerify, async (req, res) => {
    try {
        const result = await organisationService.updateOrganisation(req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation address/update: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;