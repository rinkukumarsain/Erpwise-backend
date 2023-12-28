const moment = require('moment');
const XLSX = require('xlsx');

// Local Import
const { leadDao } = require('../dao');
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
 * @param {string} orgId - id of organisation.
 * @returns {object} - An object with the results, including the new supplier item.
 */
exports.createSupplierItem = async (auth, supplierItemData, orgId) => {
    try {
        const { email, _id, fname, lname } = auth;

        const findSupplier = await query.findOne(supplierModel, { _id: supplierItemData.supplierId, isActive: true });
        // console.log('findSupplier>>>>>>>>>>>>>', findSupplier);
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }

        const findUniqueName = await query.findOne(supplierItemsModel, { partNumber: supplierItemData.partNumber, supplierId: supplierItemData.supplierId, organisationId: orgId });
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
        supplierItemData.organisationId = orgId;
        supplierItemData.partNumberCode = supplierItemData.partNumber.replace(/[-/]/g, '').toLowerCase();
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
 * @param {string} orgId - id of organisation.
 * @returns {object} - An object with the results, including updated Supplier Item.
 */
exports.updateSupplierItemById = async (auth, _id, body, orgId) => {
    try {
        const findData = await query.findOne(supplierItemsModel, { _id, isDeleted: false, organisationId: orgId });
        if (!findData) {
            return {
                success: false,
                message: 'Supplier Item not found.'
            };
        }
        const findSupplier = await query.findOne(supplierModel, { _id: findData.supplierId, isActive: true });
        // console.log('findSupplier>>>>>>>>>>>>>', findSupplier);
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        if (body.partNumber) {
            const findUniqueName = await query.findOne(supplierItemsModel, { partNumber: body.partNumber, supplierId: findSupplier.supplierId, organisationId: orgId });
            if (findUniqueName) {
                return {
                    success: false,
                    message: 'Supplier item part number already exist.'
                };
            }
            body.partNumberCode = body.partNumber.replace(/[-/]/g, '').toLowerCase();
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
 * @param {string} orgId - id of organisation.
 * @returns {object} - An object with the results.
 */
exports.delete = async (auth, _id, orgId) => {
    try {
        const findData = await query.findOne(supplierItemsModel, { _id, isDeleted: false, organisationId: orgId });
        if (!findData) {
            return {
                success: false,
                message: 'Supplier Item not found.'
            };
        }

        const findSupplier = await query.findOne(supplierModel, { _id: findData.supplierId, isActive: true });
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
 * get All Available HsCode
 *
 * @param {string} orgId - id of organisation.
 * @returns {object} - An object with the results.
 */
exports.getAllAvailableHsCode = async (orgId) => {
    try {

        const findData = await query.aggregation(supplierItemsModel, leadDao.getAllAvailableHsCodePipeline(orgId));
        if (findData.length > 0) {
            let obj = {};
            for (let ele of findData) obj[ele.hscode] = ele.hscode;
            return {
                success: true,
                message: 'All availabe hscodes',
                data: obj || {}
            };
        } else {
            return {
                success: false,
                message: 'Error while fetching hscode',
                data: {}
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error check Unique HsCode: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Bulk upload and insert multiple supplier iteams.
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} orgId - id of organisation.
 * @param {string} supplierId - id of supplier.
 * @param {string} path - path of uploaded file.
 * @returns {object} - An object with the results.
 */
exports.itemBulkUpload = async (auth, orgId, supplierId, path) => {
    try {
        const { email, _id, fname, lname } = auth;
        const constData = ['partNumber', 'partDesc', 'hscode', 'unitPrice', 'delivery', 'notes'];
        const workbook = XLSX.readFile(path);
        const sheetNames = workbook.SheetNames;
        const worksheet = workbook.Sheets[sheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const documentsToSave = [];
        for (let i = 1; i < jsonData.length; i++) {
            let obj = { supplierId, organisationId: orgId, createdBy: _id };
            for (let j = 0; j < jsonData[i].length; j++) {
                if (!jsonData[i][j]) jsonData[i][j] = 'N/A';
                if (j == 0) {
                    obj['partNumberCode'] = `${jsonData[i][j]}`.replace(/[-/]/g, '').toLowerCase();
                }
                obj[constData[j]] = constData[j] == 'unitPrice' ? +jsonData[i][j] || 0 : jsonData[i][j];
            }
            documentsToSave.push(obj);
        }
        let data = await supplierItemsModel.insertMany(documentsToSave);
        if (data.length > 0) {
            let obj = {
                performedBy: _id,
                performedByEmail: email,
                actionName: `Supplier item (bulk upload item quantity :- ${data.length}) added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
            };
            await supplierModel.updateOne({ _id: supplierId }, { $push: { Activity: obj }, isItemAdded: true });
            return {
                success: true,
                message: 'Supplier iteam bulk upload',
                data: data
            };
        }
        return {
            success: false,
            message: 'Error while supplier iteam bulk upload',
            data: []
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while uploading supplier iteam in bulk: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};