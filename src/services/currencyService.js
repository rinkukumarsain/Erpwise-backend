// Local Import
const { currencyModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/currencyServices';

/**
 * Creates a new currency.
 *
 * @param {object} currencyData - Data for creating a new currency.
 * @returns {object} - An object with the results, including the new currency.
 */
exports.createCurrency = async (currencyData) => {
    try {
        const newCurrency = await query.create(currencyModel, currencyData);
        return {
            success: true,
            message: 'Currency created successfully.',
            data: newCurrency
        };
    } catch (error) {
        logger.error(LOG_ID, `Error creating currency: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets all currencies.
 *
 * @returns {object} - An object with the results, including all currencies.
 */
exports.getAllCurrencies = async () => {
    try {
        const currencies = await query.find(currencyModel);
        return {
            success: true,
            message: 'Currencies fetched successfully.',
            data: currencies
        };
    } catch (error) {
        logger.error(LOG_ID, `Error fetching currencies: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets a currency by ID.
 *
 * @param {string} currencyId - The ID of the currency to be fetched.
 * @returns {object} - An object with the results, including the requested currency.
 */
exports.getCurrencyById = async (currencyId) => {
    try {
        const currency = await query.findById(currencyModel, currencyId);
        if (!currency) {
            return {
                success: false,
                message: 'Currency not found'
            };
        }
        return {
            success: true,
            message: 'Currency fetched successfully.',
            data: currency
        };
    } catch (error) {
        logger.error(LOG_ID, `Error fetching currency: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Updates a currency by ID.
 *
 * @param {string} currencyId - The ID of the currency to be updated.
 * @param {object} updatedData - Updated data for the currency.
 * @returns {object} - An object with the results, including the updated currency.
 */
exports.updateCurrencyById = async (currencyId, updatedData) => {
    try {
        const updatedCurrency = await currencyModel.findByIdAndUpdate(
            currencyId,
            updatedData,
            { new: true, runValidators: true }
        );
        if (!updatedCurrency) {
            return {
                success: false,
                message: 'Currency not found'
            };
        }
        return {
            success: true,
            message: 'Currency updated successfully.',
            data: updatedCurrency
        };
    } catch (error) {
        logger.error(LOG_ID, `Error updating currency: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Deletes a currency by ID.
 *
 * @param {string} currencyId - The ID of the currency to be deleted.
 * @returns {object} - An object with the results, including the deleted currency.
 */
exports.deleteCurrencyById = async (currencyId) => {
    try {
        const deletedCurrency = await currencyModel.findByIdAndRemove(currencyId);
        if (!deletedCurrency) {
            return {
                success: false,
                message: 'Currency not found'
            };
        }
        return {
            success: true,
            message: 'Currency deleted successfully.',
            data: deletedCurrency
        };
    } catch (error) {
        logger.error(LOG_ID, `Error deleting currency: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};
