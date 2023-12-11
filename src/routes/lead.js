const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { leadServices } = require('../services');
const { leadValidators: { createLead, getAllLead, updateLeadById, qualifyLeadById, createProspect } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/lead';

/**
 * Route for creating lead.
 */
router.post('/create', jwtVerify, validate(createLead), async (req, res) => {
    try {
        const result = await leadServices.createLead(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all leads.
 */
router.get('/getAll', jwtVerify, validate(getAllLead), async (req, res) => {
    try {
        const result = await leadServices.getAllLead(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});
/**
 * Route for update Lead By Id
 */
router.post('/updateLeadById/:id', jwtVerify, validate(updateLeadById), async (req, res) => {
    try {
        const result = await leadServices.updateLeadById(req.auth, req.params.id, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});
/**
 * Route for delete Lead By Id
 */
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await leadServices.delete(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for update Lead By Id
 */
router.post('/updateLeadById/:id', jwtVerify, validate(updateLeadById), async (req, res) => {
    try {
        const result = await leadServices.updateLeadById(req.auth, req.params.id, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for delete Lead By Id
 */
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await leadServices.delete(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for qualifying Lead By Id
 */
router.post('/qualify/:id', jwtVerify, validate(qualifyLeadById), async (req, res) => {
    try {
        const result = await leadServices.qualifyLeadById(req.auth, req.params.id, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during login: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for creating lead prospect.
 */
router.post('/prospect/create', jwtVerify, validate(createProspect), async (req, res) => {
    try {
        const result = await leadServices.createProspect(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during lead/prospect/create: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;