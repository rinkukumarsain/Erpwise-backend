const moment = require('moment');
// Local Import
const { leadModel, leadAddressModel } = require('../dbModel');
const { leadDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/leadAddressService';

/**
 * Creates a new lead contact.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} body - Data for creating a new lead contact.
 * @returns {object} - An object with the results, including the new lead contact.
 */
exports.create = async (auth, body) => {
    try {
        const { email, _id } = auth;

        const findLead = await query.findOne(leadModel, { _id: body.leadId, isActive: true });
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
            actionName: `Lead Address creation by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
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
 * Gets all Lead.
 *
 * @param {string} leadId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including all Lead.
 */
exports.getAllLeadAddress = async (leadId) => {
    try {
        if (!leadId) {
            return {
                success: false,
                message: 'lead not found.'
            };
        }
        const data = await query.aggregation(leadAddressModel, leadDao.getAllLeadContectPipeline(leadId));
        return {
            success: true,
            message: 'Lead fetched successfully.',
            data
        };
    } catch (error) {
        logger.error(LOG_ID, `Error fetching lead: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Updates a Lead by ID.
 *
 * @param {string} _id - The ID of the Lead contect id  be updated.
 * @param {string} leadId - The ID of the Lead to be updated.
 * @param {object} updatedData - Updated data for the Lead.
 * @returns {object} - An object with the results, including the updated Lead.
 */
exports.update = async (auth, _id, leadId, body) => {
    try {
        if (!leadId) {
            return {
                success: false,
                message: 'lead not found.'
            };
        }
        const findData = await query.findOne(leadAddressModel, { _id, isActive: true });
        if (!findData) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        };
        const findLead = await query.findOne(leadModel, { _id: findData.leadId, isActive: true });
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
            actionName: `lead Address update  by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);

        const data = await leadAddressModel.findByIdAndUpdate(_id, body, { new: true, runValidators: true });
        if (data) {
            await leadModel.updateOne({ _id: findLead._id }, { Activity: findLead.Activity, isAddressAdded: true });
        }
        return {
            success: true,
            message: 'lead Address updated successfully.',
            data
        };
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
 * @param {string} _id - The ID of the Lead Contact to be deleted.
 * @returns {object} - An object with the results, including the deleted Lead.
 */
exports.delete = async (_id) => {
    try {
        const data = await leadAddressModel.findByIdAndDelete(_id);
        if (!data) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }
        return {
            success: true,
            message: 'Lead Contact deleted successfully.',
            data
        };
    } catch (error) {
        logger.error(LOG_ID, `Error deleting lead: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};
