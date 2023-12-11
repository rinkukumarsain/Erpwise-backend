const moment = require('moment');
// Local Import
const { leadModel, leadContactModel } = require('../dbModel');
const { leadDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/leadContactService';

/**
 * Creates a new lead contact.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} leadContactData - Data for creating a new lead contact.
 * @returns {object} - An object with the results, including the new lead contact.
 */
exports.createLeadContact = async (auth, leadContactData) => {
    try {
        const { email, _id } = auth;

        const findLead = await query.findOne(leadModel, { _id: leadContactData.leadId, isActive: true });
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
            actionName: `Lead contact creation by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const newLeadContact = await query.create(leadContactModel, leadContactData);
        if (newLeadContact) {
            await leadModel.updateOne({ _id: leadContactData.leadId }, { Activity: findLead.Activity, isContactAdded: true });
            return {
                success: true,
                message: 'Lead contact created successfully.',
                data: newLeadContact
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
exports.getAllLeadContact = async (leadId) => {
    try {
        if (!leadId) {
            return {
                success: false,
                message: 'lead not found.'
            };
        }
        const data = await query.aggregation(leadContactModel, leadDao.getAllLeadContectPipeline(leadId));
        return {
            success: true,
            message: 'Lead contact fetched successfully.',
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
 * Updates a Lead contact by ID.
 *
 * @param {string} auth - The ID of the Lead to be updated.
 * @param {string} _id - The ID of the Lead  be updated.
 * @param {string} body - Updated data for the Lead contact.
 * @returns {object} - An object with the results, including updated Lead contact.
 */
exports.updateLeadContactById = async (auth, _id, body) => {
    try {
        const findData = await query.findOne(leadContactModel, { _id, isActive: true });
        if (!findData) {
            return {
                success: false,
                message: 'Lead Contact not found.'
            };
        }
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
            actionName: `Lead contact update  by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const data = await leadContactModel.findByIdAndUpdate(_id, body, { new: true, runValidators: true });
        if (data) {
            await leadModel.updateOne({ _id: findLead._id }, { Activity: findLead.Activity });
            return {
                success: true,
                message: 'Lead contact updated successfully.',
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
 * @param {string} _id - The ID of the Lead Contact to be deleted.
 * @returns {object} - An object with the results, including the deleted Lead.
 */
exports.delete = async (_id) => {
    try {
        const data = await leadContactModel.findByIdAndDelete(_id);
        if (!data) {
            return {
                success: false,
                message: 'Lead Contact not found.'
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
