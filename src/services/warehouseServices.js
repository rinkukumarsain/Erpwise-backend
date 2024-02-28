// Local Import
const { warehouseModel, enquiryItemShippmentModel } = require('../dbModel');
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
        delete body.isActive;
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
                success: true,
                message: 'Warehouse not found!',
                data: []
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

/**
 * Gets all warehouse goods in for dashboard of warehouse.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {object} queryObj - filters for getting all Enquiry.
 * @returns {object} - An object with the results, including all warehouse goods in.
 */
exports.getAllGoodsIn = async (orgId, queryObj) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { page = 1, perPage = 10, sortBy, sortOrder, search } = queryObj;
        const result = await query.aggregation(enquiryItemShippmentModel, warehouseDao.getAllGoodsInPipeline(orgId, { page: +page, perPage: +perPage, sortBy, sortOrder, search }));
        const totalPages = Math.ceil(result.length / perPage);
        return {
            success: true,
            message: `Warehouse goods in data fetched successfully.`,
            data: {
                result,
                pagination: {
                    page,
                    perPage,
                    totalChildrenCount: result.length,
                    totalPages
                }
            }
        };
    } catch (error) {
        logger.error(LOG_ID, `Error fetching warehouse goods in data: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets warehouse goods in for dashboard of warehouse by id.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {string} shipmentId - Id of shipment.
 * @returns {object} - An object with the results, including all warehouse goods in.
 */
exports.getGoodsInById = async (orgId, shipmentId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const result = await query.aggregation(enquiryItemShippmentModel, warehouseDao.getGoodsInByIdPipeline(orgId, shipmentId));
        return {
            success: true,
            message: `Warehouse goods in data fetched successfully.`,
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error fetching warehouse goods in by id data: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// /**
//  * Edit enquiry item shipment by id update status to Shipment Dispatched
//  *
//  * @param {string} enquiryId - enquiry id.
//  * @param {string} shipmentId - shipment id.
//  * @param {string} orgId - organisation id.
//  * @param {object} body - req body.
//  * @param {object} auth - req auth.
//  * @returns {object} - An object with the results.
//  */
// exports.AcceptTheGoodsGI = async (enquiryId, shipmentId, orgId, body, auth) => {
//     try {
//         const { _id, fname, lname, role } = auth;
//         const findShipment = await query.findOne(enquiryItemShippmentModel, { _id: shipmentId, enquiryId, organisationId: orgId, isDeleted: false, isActive: true });
//         if (!findShipment) {
//             return {
//                 success: false,
//                 message: 'Enquiry shipment not found.'
//             };
//         }
//         if (findShipment.level >= 2) {
//             const text = shipmentLevel[findShipment.level]?.split('_').join(' ');
//             return {
//                 success: false,
//                 message: `The order tracking has already begun, the current status is '${text}'`
//             };
//         }
//         if (!findShipment.readyForDispatch) {
//             return {
//                 success: false,
//                 message: 'First please update the shipment status to ready to dispatch.'
//             };
//         }
//         body.createdBy = _id;
//         body.updatedBy = _id;
//         body.createdByName = `${fname} ${lname}`;
//         body.createdByRole = role;
//         body.warehouseComment = null;
//         body.warehouseDocument = null;
//         body.warehouseRecievedDate = null;
//         body.warehouseQtyRecieved = 0;
//         body.warehouseQtyDamagedReturn = 0;
//         body.isGoodsAccepted = false;
//         const update = await enquiryItemShippmentModel.findByIdAndUpdate(shipmentId, { shipmentDispatched: body, level: findShipment.shipTo == 'warehouse' ? 2 : 3, stageName: findShipment.shipTo == 'warehouse' ? 'Warehouse_Goods_Out_(GO)' : 'Shipment_Delivered' }, { new: true, runValidators: true });
//         if (update) {
//             return {
//                 success: true,
//                 message: `Shipment(${findShipment.Id}) is dispatched successfully.`
//             };
//         }
//         return {
//             success: false,
//             message: `Error while updating shipment(${findShipment.Id}) status to shipment dispatch.`
//         };
//     } catch (error) {
//         logger.error(LOG_ID, `Error while editing enquiry item shipment by id update status to shipment dispatch: ${error}`);
//         return {
//             success: false,
//             message: 'Something went wrong'
//         };
//     }
// };
