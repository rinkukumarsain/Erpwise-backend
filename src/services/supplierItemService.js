const moment = require('moment');
// Local Import
// const { rolesKeys } = require('../../config/default.json');
const { supplierModel, supplierItemsModel } = require('../dbModel');
// const { registerUser } = require('./userService');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/supplierItemService';

/**
 * Creates a new supplier item.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} supplierItemData - Data for creating a new supplier item.
 * @returns {object} - An object with the results, including the new supplier item.
 */
exports.createSupplierItem = async (auth, supplierItemData) => {
    try {
        const { email, _id, fname, lname } = auth;

        const findSupplier = await query.findOne(supplierModel, { _id: supplierItemData.supplierId, isActive: true, isDeleted: false });
        // console.log('findSupplier>>>>>>>>>>>>>', findSupplier);
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }

        const findUniqueName = await query.findOne(supplierItemsModel, { partNumber: supplierItemData.partNumber, supplierId: supplierItemData.supplierId });
        if (findUniqueName) {
            return {
                success: false,
                message: 'Supplier item part number already exist.'
            };
        }
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Supplier item added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findSupplier.Activity.push(obj);
        supplierItemData.createdBy = _id;
        const newsupplierItem = await query.create(supplierItemsModel, supplierItemData);
        if (newsupplierItem) {
            await supplierModel.updateOne({ _id: supplierItemData.supplierId }, { Activity: findSupplier.Activity, isItemAdded: true });
            return {
                success: true,
                message: 'Supplier item added successfully.',
                data: newsupplierItem
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error while adding Supplier item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Updates a Supplier Item by ID.
 *
 * @param {string} auth - req.auth.
 * @param {string} _id - The ID of the Supplier Item be updated.
 * @param {string} body - Updated data for the Supplier Item.
 * @returns {object} - An object with the results, including updated Supplier Item.
 */
exports.updateSupplierItemById = async (auth, _id, body) => {
    try {
        const findData = await query.findOne(supplierItemsModel, { _id, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Supplier Item not found.'
            };
        }
        const findSupplier = await query.findOne(supplierModel, { _id: findData.supplierId, isActive: true, isDeleted: false });
        // console.log('findSupplier>>>>>>>>>>>>>', findSupplier);
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        if (body.partNumber) {
            const findUniqueName = await query.findOne(supplierItemsModel, { partNumber: body.partNumber, supplierId: findSupplier.supplierId });
            if (findUniqueName) {
                return {
                    success: false,
                    message: 'Supplier item part number already exist.'
                };
            }
        }

        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier item update by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findSupplier.Activity.push(obj);
        body.updatedBy = auth._id;
        const data = await supplierItemsModel.findByIdAndUpdate(_id, body, { new: true, runValidators: true });
        if (data) {
            await supplierModel.updateOne({ _id: findSupplier._id }, { Activity: findSupplier.Activity });
            return {
                success: true,
                message: 'Supplier item updated successfully.',
                data
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error updating Supplier item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Deletes a Supplier item by ID.
 *
 * @param {string} auth - req.auth.
 * @param {string} _id - The ID of the Supplier item to be deleted.
 * @returns {object} - An object with the results.
 */
exports.delete = async (auth, _id) => {
    try {
        const findData = await query.findOne(supplierItemsModel, { _id, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Supplier Item not found.'
            };
        }

        const findSupplier = await query.findOne(supplierModel, { _id: findData.supplierId, isActive: true, isDeleted: false });
        // console.log('findSupplier>>>>>>>>>>>>>', findSupplier);
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        const data = await supplierItemsModel.findByIdAndUpdate(_id, { isDeleted: true });
        if (!data) {
            return {
                success: false,
                message: 'Supplier Item not found.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier item deleted by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findSupplier.Activity.push(obj);
        await supplierModel.updateOne({ _id: findSupplier._id }, { Activity: findSupplier.Activity });
        return {
            success: true,
            message: 'Supplier item deleted successfully.'
        };
    } catch (error) {
        logger.error(LOG_ID, `Error deleting Supplier: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Deletes a Supplier item by ID.
 *
 * @param {object} data - req.body.
 * @returns {object} - An object with the results.
 */
exports.checkUniqueHsCode = async (data) => {
    try {
        if (data.length > 0) {
            let arr = [];
            for (let ele of data) {
                ele.hscode && arr.push(ele.hscode);
            }
            console.log('arr>>>>>>', arr.length);
            // const findData = await query.find(supplierItemsModel, { hscode: { $in: arr } });
            // if (findData.length == 0) {
            //     return {
            //         success: true,
            //         message: 'No dupllicate hs code found.',
            //         data: []
            //     };
            // }

        }
    } catch (error) {
        logger.error(LOG_ID, `Error check Unique HsCode: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};