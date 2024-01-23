// Local Import
const { warehouseModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');
const { generateId } = require('../utils/generateId');
const { warehouseDao } = require('../dao');

const LOG_ID = 'services/warehouseService';

/**
 * Create a new warehouse.
 *
 * @param {object} auth - The authenticated user information.
 * @param {object} body - The request body containing warehouse information.
 * @param {string} orgId - The request headers containing id of organization.
 * @returns {Promise<object>} - A promise that resolves to an object with the success status, message, and data.
 */
exports.create = async (auth, body, orgId) => {
    try {
        // Check if the name is unique
        const checkUniqueName = await query.findOne(warehouseModel, { name: body.name });
        if (checkUniqueName) {
            return {
                success: false,
                message: 'This warehouse name is already taken. Please choose a different one.',
                data: { name: body.name }
            };
        }

        // Set createdBy, updatedBy, organisationId and Id properties
        body.createdBy = auth._id;
        body.updatedBy = auth._id;
        body.organisationId = orgId;
        body.Id = generateId('W');

        // Insert the Warehouse
        let insertWarehouse = await query.create(warehouseModel, body);

        // Check if the Warehouse was inserted successfully
        if (insertWarehouse) {
            return {
                success: true,
                message: `${body.name}(Warehouse) created successfully.`,
                data: insertWarehouse
            };
        } else {
            return {
                success: false,
                message: 'Error while creating agent.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during create warehouse: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Get all warehouse
 * 
 * @param {string} orgId - organisational id from headers
 * @returns {object} - An object
 */
exports.getAll = async (orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const warehouseList = await query.aggregation(warehouseModel, warehouseDao.getAllWarehousePipeline(orgId));
        if (warehouseList.length == 0) {
            return {
                success: false,
                message: 'Warehouse not found!'
            };
        }
        return {
            success: true,
            message: 'Warehouse fetched successfully!',
            data: warehouseList
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all warehouse: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit warehouse by id.
 *
 * @param {string} id - The id of warehouse.
 * @param {object} auth - The authenticated user information.
 * @param {object} body - The request body containing warehouse information.
 * @param {string} orgId - The request headers containing id of organization.
 * @returns {Promise<object>} - A promise that resolves to an object with the success status, message, and data.
 */
exports.edit = async (id, auth, body, orgId) => {
    try {
        const warehouse = await query.findOne(warehouseModel, { _id: id, organisationId: orgId, isDeleted: false });
        if (!warehouse) {
            return {
                success: false,
                message: 'Warehouse not found!'
            };
        }
        if (body.name) {
            // Check if the name is unique
            const checkUniqueName = await query.findOne(warehouseModel, { name: body.name, _id: { $ne: id } });
            if (checkUniqueName) {
                return {
                    success: false,
                    message: 'This warehouse name is already taken. Please choose a different one.',
                    data: { name: body.name }
                };
            }
        }
        body.updatedBy = auth._id;
        const updateWarehouse = await warehouseModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (updateWarehouse) {
            return {
                success: true,
                message: 'Warehouse updated successfully.',
                data: updateWarehouse
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during updating warehouse by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Delete warehouse by id.
 *
 * @param {string} id - The id of warehouse.
 * @param {string} orgId - The request headers containing id of organization.
 * @returns {Promise<object>} - A promise that resolves to an object with the success status, message, and data.
 */
exports.delete = async (id, orgId) => {
    try {
        const warehouse = await query.findOne(warehouseModel, { _id: id, organisationId: orgId, isDeleted: false });
        if (!warehouse) {
            return {
                success: false,
                message: 'Warehouse not found!'
            };
        }
        const deleteWarehouse = await warehouseModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true, runValidators: true });
        if (deleteWarehouse) {
            return {
                success: true,
                message: 'Warehouse deleted successfully.'
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred during deleting warehouse by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};