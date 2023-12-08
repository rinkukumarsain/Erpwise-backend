const moment = require('moment');
// Local Import
const { leadModel } = require('../dbModel');
const { leadDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/currencyService';

/**
 * Creates a new lead.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} leadData - Data for creating a new lead.
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the new lead.
 */
exports.createLead = async (auth, leadData, orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { email, _id } = auth;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Lead creation by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        leadData.Activity = [obj];
        leadData.createdBy = _id;
        leadData.organisationId = orgId;
        leadData.Id = `LeadId-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
        const newLead = await query.create(leadModel, leadData);
        return {
            success: true,
            message: 'Lead created successfully.',
            data: newLead
        };
    } catch (error) {
        logger.error(LOG_ID, `Error creating lead: ${error}`);
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
        const leadData = await query.aggregation(leadModel, leadDao.getAllLeadPipeline(orgId));
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
        const updatedLead = await leadModel.findByIdAndUpdate(
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
        const deletedLead = await leadModel.findByIdAndUpdate(
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
