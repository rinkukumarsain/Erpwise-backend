const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { uploadS3 } = require('../utils/multer');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { leadServices } = require('../services');
const { leadValidators: { createLead, getAllLead, updateLeadById, qualifyLeadById, createProspect, addLeadFinance } } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/lead';

/**
 * Route for creating lead.
 */
router.post('/create', jwtVerify, authorizeRoleAccess, validate(createLead), async (req, res) => {
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
router.get('/getAll', jwtVerify, authorizeRoleAccess, validate(getAllLead), async (req, res) => {
    try {
        const result = await leadServices.getAllLead(req.headers['x-org-type'], req.query);
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
router.post('/updateLeadById/:id', jwtVerify, authorizeRoleAccess, validate(updateLeadById), async (req, res) => {
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
router.get('/delete/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
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
router.post('/qualify/:id', jwtVerify, authorizeRoleAccess, validate(qualifyLeadById), async (req, res) => {
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
router.post('/prospect/create', jwtVerify, authorizeRoleAccess, validate(createProspect), async (req, res) => {
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

/**
 * Route for adding new lead finance.
 */
router.post('/finance/create/:id', jwtVerify, authorizeRoleAccess, validate(addLeadFinance), async (req, res) => {
    try {
        const result = await leadServices.addLeadFinance(req.auth, req.body, req.params.id, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during lead/finance/create/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for uploading lead document.
 */
router.post('/upload/:id', jwtVerify, authorizeRoleAccess, uploadS3.single('image'), async (req, res) => {
    try {
        const result = await leadServices.uploadLeadDocument(req.params.id, req.file, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during uploadLeadDocument: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting lead document.
 */
router.post('/deleteDocument/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await leadServices.deleteLeadDocument(req.params.id, req.body.imageUrl, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during deleteLeadDocument: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all lead dashboard count.
 */
router.get('/getDashboardCount', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await leadServices.getLeadDashBoardCount(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during getting all lead dashboard count: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all lead pipeline data.
 */
router.get('/getPipelineData', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await leadServices.getPipelineData(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during getting all lead pipeline data: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});


module.exports = router;