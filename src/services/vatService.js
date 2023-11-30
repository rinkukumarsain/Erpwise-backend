const { vatModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/vatService';

// Create operation
exports.createVat = async (vatData) => {
    try {
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
}

// Read operation - Get all vats
exports.getAllVat = async () => {
    try {
        const { isActive } = queryParam;
        let obj = {};
        if (isDefault) obj['isActive'] = isActive === 'true' ? true : false;

        const vatList = await query.find(vatModel, obj);
        if (!vatList.length) {
            return {
                success: false,
                message: 'Vat not found!'
            }
        }
        return {
            success: true,
            message: 'Vat fetched successfully!',
            data: vatList
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all vat: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

// Read operation - Get vats by ID
exports.getvatById = async (vatId) => {
    try {
        const vat = await query.findOne(vatModel, { _id: vatId, isActive: true });
        if (!vat) {
            return {
                success: false,
                message: 'Vat not found!'
            }
        }
        return {
            success: true,
            message: 'Vat fetched successfully!',
            data: vatList
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting vat by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

// Update operation
exports.updatevat = async (vatId, updateData) => {
    try {
        const result = await vat.findByIdAndUpdate(
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
}

// Delete operation
exports.deletevat = async (vatId) => {
    try {
        const result = await vat.findByIdAndUpdate(
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
}
