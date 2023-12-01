const { organisationAddressModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/currencyServices';

// Create operation
/**
 *
 * @param {object} organisationAddressData - check
 */
exports.createOrganisationAddress = async (organisationAddressData) => {
    try {
        if (organisationAddressData.addresstype === 'Billing') {
            const organisationBillAddress = await query.find(organisationAddressModel, { addresstype: 'Billing', isDefault: true });
            if (!organisationBillAddress.length) {
                organisationAddressData.isDefault = true;
            }
        }
        const result = await query.create(organisationAddressModel, organisationAddressData);
        return {
            success: true,
            message: 'Organisation address added successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while adding address: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Read operation - Get all organisation addresses
/**
 *
 * @param {object} queryParam - check
 */
exports.getAllOrganisationAddresses = async (queryParam) => {
    try {
        const { addresstype, isDefault, isActive } = queryParam;
        let obj = {};
        if (addresstype) obj['addresstype'] = addresstype;
        if (isDefault) obj['isDefault'] = isDefault === 'true' ? true : false;
        if (isDefault) obj['isActive'] = isActive === 'true' ? true : false;

        const organisationAddresses = await query.find(organisationAddressModel, obj);
        if (!organisationAddresses.length) {
            return {
                success: false,
                message: 'Address not found!'
            };
        }
        return {
            success: true,
            message: 'Organisation address fetched successfully!',
            data: organisationAddresses
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching address of organisation: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Read operation - Get organisation address by ID
/**
 *
 * @param {string} organisationAddressId - check
 */
exports.getOrganisationAddressById = async (organisationAddressId) => {
    try {
        const organisationAddress = await query.findOne(organisationAddressModel, { _id: organisationAddressId, isActive: true });
        if (!organisationAddress) {
            return {
                success: false,
                message: 'Address not found!'
            };
        }
        return {
            success: true,
            message: 'Organisation address fetched successfully!',
            data: organisationAddress
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching address by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Update operation
/**
 *
 * @param {string} organisationAddressId - organisation id
 * @param {object} updateData - data to be updated
 */
exports.updateOrganisationAddress = async (organisationAddressId, updateData) => {
    try {
        if (updateData.addresstype === 'Billing' && updateData.isDefault === true) {
            await organisationAddressModel.findOneAndUpdate(
                { addresstype: 'Billing', isDefault: true },
                { isDefault: false },
                { new: true }
            );
        }
        const result = await organisationAddressModel.findByIdAndUpdate(
            organisationAddressId,
            { $set: updateData },
            { new: true }
        );
        if (!result) {
            return {
                success: false,
                message: 'Address not found!'
            };
        }
        return {
            success: true,
            message: 'Organisation updated successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while updating address of organisation: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Delete operation
/**
 *
 * @param {string} organisationAddressId - organisation id 
 */
exports.deleteOrganisationAddress = async (organisationAddressId) => {
    try {
        const result = await organisationAddressModel.findByIdAndUpdate(organisationAddressId, { isActive: false });
        return {
            success: true,
            message: 'Organisation deleted successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while deleting address of organisation: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};
