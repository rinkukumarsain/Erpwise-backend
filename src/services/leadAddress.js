const moment = require('moment');
// Local Import
const { leadModel, leadAddressModel } = require('../dbModel');
// const { leadDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/leadAddressService';

/**
 * Creates a new lead address.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} body - Data for creating a new lead address.
 * @returns {object} - An object with the results, including the new lead address.
 */
exports.create = async (auth, body) => {
    try {
        const { email, _id, fname, lname } = auth;

        const findLead = await query.findOne(leadModel, { _id: body.leadId, isActive: true, isDeleted: false });
        // console.log('findLead>>>>>>>>>>>>>', findLead);
        if (!findLead) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Lead Address created by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const newLeadAddress = await query.create(leadAddressModel, body);
        if (newLeadAddress) {
            await leadModel.updateOne({ _id: body.leadId }, { Activity: findLead.Activity, isAddressAdded: true });
            return {
                success: true,
                message: 'lead Address created successfully.',
                data: newLeadAddress
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error creating lead contact: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Updates a Lead address by ID.
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} _id - The ID of the Lead address to be updated.
 * @param {object} body - Updated data for the Lead address.
 * @returns {object} - An object with the results, including the updated Lead address.
 */
exports.update = async (auth, _id, body) => {
    try {
        const findData = await query.findOne(leadAddressModel, { _id, isActive: true, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Lead address not found.'
            };
        }
        const findLead = await query.findOne(leadModel, { _id: findData.leadId, isActive: true, isDeleted: false });
        // console.log('findLead>>>>>>>>>>>>>', findLead);
        if (!findLead) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Lead Address updated by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const data = await leadAddressModel.findByIdAndUpdate(_id, body, { new: true, runValidators: true });
        if (data) {
            await leadModel.updateOne({ _id: findLead._id }, { Activity: findLead.Activity, isAddressAdded: true });
            return {
                success: true,
                message: 'lead Address updated successfully.',
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
 * Deletes a Lead by ID.
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} _id - The ID of the Lead address to be deleted.
 * @returns {object} - An object with the results, including the deleted Lead address.
 */
exports.delete = async (auth, _id) => {
    try {
        const findData = await query.findOne(leadAddressModel, { _id, isActive: true, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Lead address not found.'
            };
        }
        const findLead = await query.findOne(leadModel, { _id: findData.leadId, isActive: true, isDeleted: false });
        // console.log('findLead>>>>>>>>>>>>>', findLead);
        if (!findLead) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Lead Address deleted by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const data = await leadAddressModel.findByIdAndUpdate(_id, { isDeleted: true }, { new: true, runValidators: true });
        if (data) {
            await leadModel.updateOne({ _id: findLead._id }, { Activity: findLead.Activity });
            return {
                success: true,
                message: 'lead Address deleted successfully.',
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
 * make a address as a primary address.
 *
 * @param {string} addressId - The ID of the Lead address to be primary.
 * @returns {object} - An object with the results, including  Lead address Id.
 */
exports.makeAddressPrimary = async (addressId) => {
    try {
        await leadAddressModel.updateMany({ _id: { $ne: addressId } }, { isDefault: false });
        const makePrimary = await leadAddressModel.findOneAndUpdate({ _id: addressId, isDeleted: false }, { isDefault: true });
        const findAllAddress = await query.find(leadAddressModel, { leadId: makePrimary.leadId, isDeleted: false });
        if (makePrimary) {
            return {
                success: true,
                message: 'The address has been designated as the primary address.',
                data: findAllAddress
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error while makeing a address - Primary: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};
