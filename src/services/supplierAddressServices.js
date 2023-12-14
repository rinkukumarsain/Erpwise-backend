const moment = require('moment');
// Local Import
const { supplierModel, supplierAddressModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/supplierAddressService';

/**
 * Creates a new supplier address.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} body - Data for creating a new supplier address.
 * @returns {object} - An object with the results, including the new supplier address.
 */
exports.create = async (auth, body) => {
    try {
        const { email, _id, fname, lname } = auth;

        const findLead = await query.findOne(supplierModel, { _id: body.supplierId, isActive: true, isDeleted: false });
        // console.log('findLead>>>>>>>>>>>>>', findLead);
        if (!findLead) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Supplier address created by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const newSupplierAddress = await query.create(supplierAddressModel, body);
        if (newSupplierAddress) {
            await supplierModel.updateOne({ _id: body.supplierId }, { Activity: findLead.Activity, isAddressAdded: true });
            return {
                success: true,
                message: 'Supplier Address created successfully.',
                data: newSupplierAddress
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error creating Supplier Address: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Updates a Supplier address by ID.
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} _id - The ID of the Supplier address to be updated.
 * @param {object} body - Updated data for the Supplier address.
 * @returns {object} - An object with the results, including the updated Supplier address.
 */
exports.update = async (auth, _id, body) => {
    try {
        const findData = await query.findOne(supplierAddressModel, { _id, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Supplier address not found.'
            };
        }
        const findLead = await query.findOne(supplierModel, { _id: findData.supplierId, isActive: true, isDeleted: false });
        // console.log('findLead>>>>>>>>>>>>>', findLead);
        if (!findLead) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier address updated by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const data = await supplierAddressModel.findByIdAndUpdate(_id, body, { new: true, runValidators: true });
        if (data) {
            await supplierModel.updateOne({ _id: findLead._id }, { Activity: findLead.Activity, isAddressAdded: true });
            return {
                success: true,
                message: 'Supplier address updated successfully.',
                data
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error updating Lead: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Deletes a Supplier address by ID.
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} _id - The ID of the Supplier address to be deleted.
 * @returns {object} - An object with the results, including the deleted Supplier address.
 */
exports.delete = async (auth, _id) => {
    try {
        const findData = await query.findOne(supplierAddressModel, { _id, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Supplier address not found.'
            };
        }
        const findLead = await query.findOne(supplierModel, { _id: findData.supplierId, isActive: true, isDeleted: false });
        // console.log('findLead>>>>>>>>>>>>>', findLead);
        if (!findLead) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier address deleted by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const data = await supplierAddressModel.findByIdAndUpdate(_id, { isDeleted: true }, { new: true, runValidators: true });
        if (data) {
            await supplierModel.updateOne({ _id: findLead._id }, { Activity: findLead.Activity });
            return {
                success: true,
                message: 'Supplier address deleted successfully.',
                data
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error deleting lead: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};


/**
 * make a Supplier address as a primary address.
 *
 * @param {string} addressId - The ID of the Supplier address to be default.
 * @param {string} addresstype - The type of address to be default.
 * @returns {object} - An object with the results, including  Supplier address Id.
 */
exports.makeAddressDefault = async (addressId, addresstype) => {
    try {
        await supplierAddressModel.updateMany({ _id: { $ne: addressId }, addresstype }, { isDefault: false });
        const makePrimary = await supplierAddressModel.findOneAndUpdate({ _id: addressId, isDeleted: false, addresstype }, { isDefault: true });
        const findAllAddress = await query.find(supplierAddressModel, { supplierId: makePrimary.supplierId, isDeleted: false });
        if (makePrimary) {
            return {
                success: true,
                message: `The address has been designated as the default address of address type ${addresstype}.`,
                data: findAllAddress
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error while makeing a address - default: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};
