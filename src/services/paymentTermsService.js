const { paymentTermsModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/paymentTermsService';

// Create operation
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
}

// Read operation - Get all payment terms
exports.getAllPaymentTerms = async () => {
    try {
        const { isActive } = queryParam;
        let obj = {};
        if (isDefault) obj['isActive'] = isActive === 'true' ? true : false;

        const paymentTermsList = await query.find(paymentTermsModel, obj);
        if (!paymentTermsList.length) {
            return {
                success: false,
                message: 'Payment term not found!'
            }
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
}

// Read operation - Get payment terms by ID
exports.getPaymentTermsById = async (paymentTermsId) => {
    try {
        const paymentTerms = await query.findOne(paymentTermsModel, { _id: paymentTermsId, isActive: true });
        if (!paymentTerms) {
            return {
                success: false,
                message: 'Payment term not found!'
            }
        }
        return {
            success: true,
            message: 'Payment term fetched successfully!',
            data: paymentTermsList
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting payment term by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

// Update operation
exports.updatePaymentTerms = async (paymentTermsId, updateData) => {
    try {
        const result = await PaymentTerms.findByIdAndUpdate(
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
}

// Delete operation
exports.deletePaymentTerms = async (paymentTermsId) => {
    try {
        const result = await PaymentTerms.findByIdAndUpdate(
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
}
