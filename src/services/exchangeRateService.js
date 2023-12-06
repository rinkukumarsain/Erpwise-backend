// Local Import
const {  organisationModel, exchangeRateModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/userService';

/**
 * Authenticates a user by verifying their credentials.
 *
 * @param {object} reqBody - The request body containing `email` and `password`.
 * @returns {object} - An object with authentication results:
 *   - `success` (boolean): Indicates whether the authentication was successful.
 *   - `message` (string): A message describing the result of the authentication.
 *   - `data` (Object): User data if authentication is successful.
 *   - `token` (string): JWT token if authentication is successful.
 */
exports.create = async (reqBody) => {
    try {
        const { orgId, orgCurrency } = reqBody;
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
