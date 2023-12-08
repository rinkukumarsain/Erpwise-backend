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
        console.log('findLead>>>>>>>>>>>>>', findLead);
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
            await leadModel.updateOne({ _id: leadContactData.leadId }, { Activity: findLead.Activity });
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
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including all Lead.
 */
exports.getAllLead = async (orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const leadData = await query.aggregation(leadContactModel, leadDao.getAllLeadPipeline(orgId));
        return {
            success: true,
            message: 'Lead fetched successfully.',
            data: leadData
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
 * @param {string} leadId - The ID of the Lead to be updated.
 * @param {object} updatedData - Updated data for the Lead.
 * @returns {object} - An object with the results, including the updated Lead.
 */
exports.updateLeadById = async (leadId, updatedData) => {
    try {
        const updatedLead = await leadContactModel.findByIdAndUpdate(
            leadId,
            updatedData,
            { new: true, runValidators: true }
        );
        if (!updatedLead) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }
        return {
            success: true,
            message: 'Lead updated successfully.',
            data: updatedLead
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
 * @param {string} leadId - The ID of the Lead to be deleted.
 * @returns {object} - An object with the results, including the deleted Lead.
 */
exports.deleteLeadById = async (leadId) => {
    try {
        const deletedLead = await leadContactModel.findByIdAndUpdate(
            leadId,
            { isActive: false },
            { new: true, runValidators: true }
        );
        if (!deletedLead) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }
        return {
            success: true,
            message: 'Lead deleted successfully.',
            data: deletedLead
        };
    } catch (error) {
        logger.error(LOG_ID, `Error deleting lead: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};
