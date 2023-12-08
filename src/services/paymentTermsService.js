const { paymentTermsModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/paymentTermsService';

// Create operation
/**
 *
 * @param {object} paymentTermsData - data object to be created
 */
exports.createPaymentTerms = async (paymentTermsData) => {
    try {
        const paymentTerms = await query.create(paymentTermsModel, paymentTermsData);
        return {
            success: true,
            message: 'Payment term added successfully!',
            data: paymentTerms
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while adding payment terms: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Read operation - Get all payment terms
/**
 *
 * @param {object} queryParam - optional query params
 */
exports.getAllPaymentTerms = async (queryParam) => {
    try {
        const { isActive } = queryParam;
        let obj = {};
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;

        const paymentTermsList = await query.find(paymentTermsModel, obj);
        if (!paymentTermsList.length) {
            return {
                success: false,
                message: 'Payment term not found!'
            };
        }
        return {
            success: true,
            message: 'Payment term fetched successfully!',
            data: paymentTermsList
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all payment terms: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Read operation - Get payment terms by ID
/**
 *
 * @param {string} paymentTermsId - payment term id
 */
exports.getPaymentTermsById = async (paymentTermsId) => {
    try {
        const paymentTerms = await query.findOne(paymentTermsModel, { _id: paymentTermsId, isActive: true });
        if (!paymentTerms) {
            return {
                success: false,
                message: 'Payment term not found!'
            };
        }
        return {
            success: true,
            message: 'Payment term fetched successfully!',
            data: paymentTerms
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting payment term by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Update operation
/**
 *
 * @param {string} paymentTermsId - payment term id
 * @param {object} updateData - data to be updated
 */
exports.updatePaymentTerms = async (paymentTermsId, updateData) => {
    try {
        const result = await paymentTermsModel.findByIdAndUpdate(
            paymentTermsId,
            { $set: updateData },
            { new: true }
        );
        return {
            success: true,
            message: 'Payment term updated successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while updating payment terms: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Delete operation
/**
 *
 * @param {string} paymentTermsId - payment id
 */
exports.deletePaymentTerms = async (paymentTermsId) => {
    try {
        const result = await paymentTermsModel.findByIdAndUpdate(
            paymentTermsId,
            { $set: { isActive: false } },
            { new: true }
        );
        return {
            success: true,
            message: 'Payment term deleted successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while deleting payment terms: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Enable/Disable payment terms
 * 
 * @param {object} body - req body
 * @param {string} body.paymentTermsId - payment terms id
 * @param {boolean} body.isActive - req body (isActvie)(type bool)
 * @returns {object} - An object
 */
exports.enableOrDisablePaymentTerms = async ({ paymentTermsId, isActive }) => {
    try {
        // Update the payment terms's information
        const updatePaymentTerms = await paymentTermsModel.findOneAndUpdate({ _id: paymentTermsId }, { isActive });
        if (updatePaymentTerms) {
            return {
                success: true,
                message: `Payment terms ${isActive ? 'enabled' : 'disabled'} successfully.`,
                data: { _id: paymentTermsId }
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred while enable Or Disable PaymentTerms: ${error}`);
        return {
            success: false,
            message: 'Something went wrong.'
        };
    }
};
