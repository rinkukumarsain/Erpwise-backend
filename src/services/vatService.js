const { vatModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');
const { vatDao } = require('../dao');

const LOG_ID = 'services/vatService';

// Create operation
/**
 *
 * @param {object} vatData - data yo be created
 */
exports.createVat = async (vatData) => {
    try {
        const checkName = await query.findOne(vatModel, { name: vatData.name });
        if (checkName) {
            return {
                success: false,
                message: `Vat of ${vatData.name} already exist.`
            };
        }
        const vat = await query.create(vatModel, vatData);
        return {
            success: true,
            message: 'Vat added successfully!',
            data: vat
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while adding vat: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Read operation - Get all vats
/**
 *
 * @param {object} queryParam - optional parameter
 */
exports.getAllVat = async (queryParam) => {
    try {
        const { isActive, page = 1, perPage = 10, sortBy, sortOrder, search } = queryParam;
        const vatList = await query.aggregation(vatModel, vatDao.getAllVatPipeline({ isActive, page: +page, perPage: +perPage, sortBy, sortOrder, search }));
        const totalPages = Math.ceil(vatList.length / perPage);
        return {
            success: true,
            message: 'Vat fetched successfully!',
            data: {
                vatList,
                pagination: {
                    page,
                    perPage,
                    totalChildrenCount: vatList.length,
                    totalPages
                }
            }
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all vat: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Read operation - Get vats by ID
/**
 *
 * @param {string} vatId - vat id
 */
exports.getvatById = async (vatId) => {
    try {
        const vat = await query.findOne(vatModel, { _id: vatId, isActive: true });
        if (!vat) {
            return {
                success: false,
                message: 'Vat not found!'
            };
        }
        return {
            success: true,
            message: 'Vat fetched successfully!',
            data: vat
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting vat by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Update operation
/**
 *
 * @param {string} vatId - vat id
 * @param {object} updateData - data to be updated
 */
exports.updatevat = async (vatId, updateData) => {
    try {
        const result = await vatModel.findByIdAndUpdate(
            vatId,
            { $set: updateData },
            { new: true }
        );
        return {
            success: true,
            message: 'Vat updated successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while updating vats: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Delete operation
/**
 *
 * @param {string} vatId - vat id
 */
exports.deletevat = async (vatId) => {
    try {
        const result = await vatModel.findByIdAndUpdate(
            vatId,
            { $set: { isActive: false } },
            { new: true }
        );
        return {
            success: true,
            message: 'Vat deleted successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while deleting vats: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Enable/Disable Vat status
 * 
 * @param {object} body - req body
 * @param {string} body.vatId - Vat id
 * @param {boolean} body.isActive - req body (isActvie)(type bool)
 * @returns {object} - An object
 */
exports.enableOrDisableVat = async ({ vatId, isActive }) => {
    try {
        // Update the Vat's information
        const updateUser = await vatModel.findOneAndUpdate({ _id: vatId }, { isActive });
        if (updateUser) {
            return {
                success: true,
                message: `Vat ${isActive ? 'enabled' : 'disabled'} successfully.`,
                data: { _id: vatId }
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred while enable Or Disable Vat: ${error}`);
        return {
            success: false,
            message: 'Something went wrong.'
        };
    }
};
