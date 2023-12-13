const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { uploadS3 } = require('../utils/multer');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { supplieServices } = require('../services');
const { supplierValidators: {
    createApprovedSupplier,
    createSupplier,
    getAllSupplier,
    updateSupplierById,
    addSupplierFinance,
    deleteSupplierDocument,
    moveToPipeLine
} } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/lead';

/**
 * Route for creating supplier.
 */
router.post('/create', jwtVerify, authorizeRoleAccess, validate(createSupplier), async (req, res) => {
    try {
        const result = await supplieServices.createSupplier(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/create : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for creating approved supplier.
 */
router.post('/approved/create', jwtVerify, authorizeRoleAccess, validate(createApprovedSupplier), async (req, res) => {
    try {
        const result = await supplieServices.createApprovedSupplier(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/approved/create : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting supplier by.
 */
router.get('/getAll', jwtVerify, authorizeRoleAccess, validate(getAllSupplier), async (req, res) => {
    try {
        const result = await supplieServices.getAllSupplier(req.headers['x-org-type'], req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/getAll : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting supplier by id.
 */
router.get('/get/:id', jwtVerify, authorizeRoleAccess, validate(getAllSupplier), async (req, res) => {
    try {
        const result = await supplieServices.getSupplierById(req.headers['x-org-type'], req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/get/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for update supplier By Id
 */
router.post('/update/:id', jwtVerify, authorizeRoleAccess, validate(updateSupplierById), async (req, res) => {
    try {
        const result = await supplieServices.updateSupplierById(req.auth, req.params.id, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/update/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for delete supplier By Id
 */
router.get('/delete/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await supplieServices.delete(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/delete/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for adding new supplier finance.
 */
router.post('/finance/create/:id', jwtVerify, authorizeRoleAccess, validate(addSupplierFinance), async (req, res) => {
    try {
        const result = await supplieServices.addSupplierFinance(req.auth, req.body, req.params.id, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/finance/create/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for uploading supplier document.
 */
router.post('/upload/:id', jwtVerify, authorizeRoleAccess, uploadS3.single('image'), async (req, res) => {
    try {
        const result = await supplieServices.uploadSupplierDocument(req.params.id, req.file, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/upload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting supplier document.
 */
router.post('/deleteDocument/:id', jwtVerify, authorizeRoleAccess, validate(deleteSupplierDocument), async (req, res) => {
    try {
        const result = await supplieServices.deleteSupplierDocument(req.params.id, req.body.imageUrl, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/deleteDocument/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all supplier dashboard count.
 */
router.get('/getDashboardCount', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await supplieServices.getSupplierDashBoardCount(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during getting all supplier dashboard count: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all supplier pipeline data.
 */
router.get('/getPipelineData', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await supplieServices.getPipelineData(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during getting all supplier pipeline data: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for moving supplier to pipeline.
 */
router.post('/moveToPipeline/:id', jwtVerify, authorizeRoleAccess, validate(moveToPipeLine), async (req, res) => {
    try {
        const result = await supplieServices.moveToPipeLine(req.auth, req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/moveToPipeline/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for moving supplier to approved suppliers
 */
router.get('/moveToApprovedSupplier/:id', jwtVerify, authorizeRoleAccess, async (req, res) => {
    try {
        const result = await supplieServices.moveToApprovedSupplier(req.auth, req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during supplier/moveToApprovedSupplier/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});


module.exports = router;