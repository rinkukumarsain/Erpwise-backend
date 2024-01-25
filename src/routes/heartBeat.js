const express = require('express');
require('pkginfo')(module, 'name', 'version');
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const router = express.Router();
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { userModel } = require('../dbModel/index.js');
const bcrypt = require('bcryptjs');


const LOG_ID = 'routes/heartBeat';
const pkgInfo = module.exports;

/**
 * Handle heartbeat requests to check the project's status.
 *
 * @param {object} req - The request object containing an optional email parameter.
 * @param {object} res - The response object.
 * @returns {void}
 */
router.get('/heartbeat/:email?', async (req, res) => {
    try {
        // Log information about the SuperAdmin's email
        logger.info(LOG_ID, `SuperAdmin Email Id :- ${req.params.email}`);

        // Check if there are no admin users and an email is provided
        const findAdmin = await userModel.find();
        if (findAdmin.length === 0 && req.params.email) {
            // Log SuperAdmin password (temporary)
            logger.info(LOG_ID, `SuperAdmin Password :- ${pkgInfo.name.split('-').join('')}@12345`);

            // Generate a hashed password for the SuperAdmin
            const salt = bcrypt.genSaltSync(10);
            const hashPass = bcrypt.hashSync(`${pkgInfo.name.split('-').join('')}@12345`, salt);

            // Create the SuperAdmin user
            const insertSuperAdmin = await userModel.create({
                fname: 'super',
                lname: 'Admin',
                email: req.params.email || null,
                employeeId: 'EMP',
                password: hashPass,
                role: 'superAdmin',
                createdBy: null,
                updatedBy: null,
                isActive: true,
                token: ''
            });

            // Log the successful insertion of the SuperAdmin
            logger.info(LOG_ID, `SuperAdmin inserted successfully :- ${insertSuperAdmin._id}`);
        }

        // Log heartbeat trigger
        logger.info(LOG_ID, `heartBeat triggered ...`);

        // Send a response indicating the project is working fine
        const response = { message: '💗 Project Working fine !!' };
        handleResponse(res, statusCode.OK, response);
    } catch (err) {
        // Log error and send an error response if an exception occurs
        logger.error(LOG_ID, `Error Occurred while getting data from heartbeat: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});



module.exports = router;