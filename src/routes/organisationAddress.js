const express = require('express');
const { validate } = require('express-validation');

const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();
const { organisationAddressService } = require('../services');
const { organisationAddressValidators: { createOrganisationAddress, getAllOrganisationAddresses, updateOrganisationAddress } } = require('../validators');


const LOG_ID = 'routes/organisationAddress';

/**
 * Route for get all organisation address.
 */
router.get('/getAll', validate(getAllOrganisationAddresses), jwtVerify, async (req, res) => {
    try {
        const result = await organisationAddressService.getAllOrganisationAddresses(req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation address/getAll: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for get organisation address by id.
 */
router.get('/getById/:id', jwtVerify, async (req, res) => {
    try {
        const result = await organisationAddressService.getOrganisationAddressById(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation address/getById: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for creating organisation address.
 */
router.post('/create', authorizeRoleAccess, validate(createOrganisationAddress), jwtVerify, async (req, res) => {
    try {
        const result = await organisationAddressService.createOrganisationAddress(req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation address/create: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for updating the organisation address.
 */
router.post('/update/:id', authorizeRoleAccess, validate(updateOrganisationAddress), jwtVerify, async (req, res) => {
    try {
        const result = await organisationAddressService.updateOrganisationAddress(req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation address/update: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting the organisation addresss.
 */
router.post('/delete/:id', authorizeRoleAccess, jwtVerify, async (req, res) => {
    try {
        const result = await organisationAddressService.deleteOrganisationAddress(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during organisation address/delete: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;