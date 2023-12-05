const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { uploadS3 } = require('../utils/multer');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { userService } = require('../services');
const { userValidators } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/user';

/**
 * Route for user login.
 */
router.post('/login', validate(userValidators.login), async (req, res) => {
    try {
        const result = await userService.login(req.body);
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
 * Route for user registration.
 */
router.post('/register', jwtVerify, authorizeRoleAccess, validate(userValidators.registerUser), async (req, res) => {
    try {
        const result = await userService.registerUser(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during registration: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Get all users according to organisation.
 */
router.get('/getAll', jwtVerify, authorizeRoleAccess, validate(userValidators.getAllUser), async (req, res) => {
    try {
        const result = await userService.getAllUsers(req.query, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during fetching all user: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Get user by id.
 */
router.get('/getById/:id', jwtVerify, authorizeRoleAccess, validate(userValidators.getAllUser), async (req, res) => {
    try {
        const result = await userService.getUserById(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during fetching user by id: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for edit user profile.
 */
router.post('/edit/:id', jwtVerify, authorizeRoleAccess, validate(userValidators.editUser), async (req, res) => {
    try {
        const result = await userService.editUser(req.params.id, req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during registration: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for updating user status.
 */
router.post('/updateStatus', jwtVerify, authorizeRoleAccess, validate(userValidators.enableOrDisableUser), async (req, res) => {
    try {
        const result = await userService.enableOrDisableUser(req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during registration: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for upload user image.
 */
router.post('/uploadimage/:id', jwtVerify, authorizeRoleAccess, uploadS3.single('image'), async (req, res) => {
    try {
        const result = await userService.uploadUserimage(req.params.id, req.file, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during uploadUserimage: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;