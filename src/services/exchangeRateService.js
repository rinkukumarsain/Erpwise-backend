const moment = require('moment');
// Local Import
const { organisationModel, exchangeRateModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');
const { default: mongoose } = require('mongoose');
const { getExchangeRatePipeline } = require('../dao/exchangeRate.dao');

const LOG_ID = 'services/exchangeRateService';

/**
 * Authenticates a user by verifying their credentials.
 *
 * @param {object}  reqBody - The request body containing `email` and `password`.
 * @param {object}  auth - Data of logedin user.
 * @param {object}  orgId - The request body containing origanisation information
 * @returns {object} - An object with authentication results:
 *   - `success` (boolean): Indicates whether the authentication was successful.
 *   - `message` (string): A message describing the result of the authentication.
 *   - `data` (Object): User data if authentication is successful.
 *   - `token` (string): JWT token if authentication is successful.
 */
exports.create = async (auth, reqBody, orgId) => {
    try {
        const { orgCurrency } = reqBody;
        const findOrganisation = await query.findOne(organisationModel, { _id: orgId }, { currency: 1 });
        if (!findOrganisation) {
            return {
                success: false,
                message: 'Organisation not found'
            };
        }

        if (!orgCurrency === findOrganisation.currency.toString()) {
            return {
                success: false,
                message: 'Invalid orgCurrency'
            };
        }
        const checkStartDate = await query.findOne(exchangeRateModel, {
            $expr: {
                $and: [
                    { $lte: [new Date(reqBody.startDate), '$endDate'] },
                    { $gte: [new Date(reqBody.startDate), '$startDate'] }
                ]
            }
        });
        const checkEndDate = await query.findOne(exchangeRateModel, {
            $expr: {
                $and: [
                    { $lte: [new Date(reqBody.endDate), '$endDate'] },
                    { $gte: [new Date(reqBody.endDate), '$startDate'] }
                ]
            }
        });
        if (checkEndDate || checkStartDate) {
            return {
                success: false,
                message: 'Dates clash, lets reschedule ...!'
            };
        }
        reqBody.orgId = orgId;
        const { email, _id } = auth;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `exchangeRate creation by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        reqBody.Activity = [obj];

        const data = await query.create(exchangeRateModel, reqBody);
        return {
            success: true,
            message: 'You have successfully craeted exchangeRate',
            data: data
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during create: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Authenticates a user by verifying their credentials.
 *
 * @param {object} reqBody - The request body containing `email` and `password`.
 * @param {object} auth - The request body containing `email` and `password`.
 * @param {object} _id - The request body containing `email` and `password`.
 * @returns {object} - An object with authentication results:
 *   - `success` (boolean): Indicates whether the authentication was successful.
 *   - `message` (string): A message describing the result of the authentication.
 *   - `data` (Object): User data if authentication is successful.
 *   - `token` (string): JWT token if authentication is successful.
 */
exports.updated = async (auth, reqBody, _id) => {
    try {
        let dateCheck;
        const { orgId, orgCurrency } = reqBody;
        if (orgId) {
            const findOrganisation = await query.findOne(organisationModel, { _id: orgId }, { currency: 1 });
            if (!findOrganisation) {
                return {
                    success: false,
                    message: 'Organisation not found'
                };
            }
            if (!orgCurrency === findOrganisation.currency.toString()) {
                return {
                    success: false,
                    message: 'Invalid orgCurrency'
                };
            }
        }
        if (reqBody.startDate) {
            dateCheck = await query.findOne(exchangeRateModel, {
                $expr: {
                    $and: [
                        { $ne: [new mongoose.Types.ObjectId(_id), '$_id'] },
                        { $lte: [new Date(reqBody.startDate), '$endDate'] },
                        { $gte: [new Date(reqBody.startDate), '$startDate'] }
                    ]
                }
            });
        }

        if (reqBody.endDate) {
            dateCheck = await query.findOne(exchangeRateModel, {
                $expr: {
                    $and: [
                        { $ne: [new mongoose.Types.ObjectId(_id), '$_id'] },
                        { $lte: [new Date(reqBody.endDate), '$endDate'] },
                        { $gte: [new Date(reqBody.endDate), '$startDate'] }
                    ]
                }
            });
        }
        if (dateCheck) {
            return {
                success: false,
                message: 'Dates clash, lets reschedule ...!'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `exchangeRate updated by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        reqBody['$push'] = { Activity: obj };
        const data = await exchangeRateModel.findByIdAndUpdate({ _id: _id }, reqBody, { new: true });
        return {
            success: true,
            message: 'You have successfully updated exchange rate',
            data: data
        };
    } catch (error) {
        console.error(error);
        logger.error(LOG_ID, `Error occurred during create: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};
/**
 * Authenticates a user by verifying their credentials.
 *
 * @param {object} reqQuery - The request query containing  'isActive' .
 * @param {object} orgId - The request query containing originasation id 
 * @returns {Array} - An object with authentication results:
 *   - `success` (boolean): Indicates whether the authentication was successful.
 *   - `message` (string): A message describing the result of the authentication.
 *   - `data` (Array): exchangeRate data if authentication is successful.
 */
exports.getExchangeRate = async (reqQuery, orgId) => {
    try {
        reqQuery.orgId = orgId;
        const pipeLine = getExchangeRatePipeline(reqQuery);
        const data = await query.aggregation(exchangeRateModel, pipeLine);
        return {
            success: true,
            message: 'You have successfully updated exchange rate',
            data: data
        };
    } catch (error) {
        console.error(error);
        logger.error(LOG_ID, `Error occurred during create: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};
