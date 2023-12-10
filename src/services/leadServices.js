const moment = require('moment');
// Local Import
const { leadModel, leadContactModel, leadAddressModel } = require('../dbModel');
const { CRMlevelEnum } = require('../../config/default.json');
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
        leadData.level = CRMlevelEnum.LEAD;
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
 * @param {string} auth -The is contain is auth user .
 * @param {string} leadId - The ID of the Lead to be updated.
 * @param {object} updatedData - Updated data for the Lead.
 * @param {object} orgId - contain organisation id .
 * @returns {object} - An object with the results, including the updated Lead.
 */
exports.updateLeadById = async (auth, leadId, updatedData, orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const data = await query.findOne(leadModel, { _id: leadId, isActive: true });
        if (!data) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Lead updated by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        updatedData['$push'] = { Activity: obj };
        const updatedLead = await leadModel.findByIdAndUpdate(
            leadId,
            updatedData,
            { new: true, runValidators: true }
        );

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
exports.delete = async (leadId) => {
    try {
        const data = await query.findOne(leadModel, { _id: leadId });
        if (!data) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }
        let arr = [];

        if (data.isContactAdded) {
            arr.push(leadContactModel.deleteMany({ leadId }));
        }
        if (data.isQualified) {
            // arr.push(leadQualifiedModel.deleteMany({ leadId }));
        }
        if (data.isAddressAdded) {
            arr.push(leadAddressModel.deleteMany({ leadId }));
        }
        if (data.isFinanceAdded) {
            // arr.push(leadFinanceModel.deleteMany({ leadId }));
        }
        arr.push(leadModel.findByIdAndDelete(leadId));
        await Promise.all(arr);
        return {
            success: true,
            message: 'Lead deleted successfully.',
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

/**
 * Qualify a Lead by ID.
 *
 * @param {string} auth -The is contain is auth user .
 * @param {string} leadId - The ID of the Lead to be updated.
 * @param {object} updateData - Updated data for the Lead (qualifymeta).
 * @param {object} orgId - contain organisation id .
 * @returns {object} - An object with the results, including the updated Lead (qualified).
 */
exports.qualifyLeadById = async (auth, leadId, updateData, orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const data = await query.findOne(leadModel, { _id: leadId, isActive: true });
        if (!data) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }

        if (!data.isContactAdded && !data.isQualified) {
            return {
                success: false,
                message: 'Lead contact not added.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: !data.isQualified ? `Lead qualified (moved to prospect) by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}` : `Lead prospect qualifymeta added by ${auth.fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        let updatedData = { qualifymeta: updateData, level: CRMlevelEnum.PROSPECT, isQualified: true };
        updatedData['$push'] = { Activity: obj };
        const updatedLead = await leadModel.findByIdAndUpdate(
            leadId,
            updatedData,
            { new: true, runValidators: true }
        );

        return {
            success: true,
            message: !data.isQualified ? 'Lead qualified successfully.' : 'Lead prospect qualifymeta added successfully.',
            data: updatedLead
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while qualifying Lead: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};


/**
 * Creates a new lead Prospect.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} prospectData - Data for creating a new lead.
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the new lead Prospect.
 */
exports.createProspect = async (auth, prospectData, orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { email, _id, fname } = auth;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Lead prospect creation by ${fname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        prospectData.Activity = [obj];
        prospectData.createdBy = _id;
        prospectData.organisationId = orgId;
        prospectData.level = CRMlevelEnum.PROSPECT;
        prospectData.Id = `LeadId-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
        prospectData.isQualified = true;
        const newLead = await query.create(leadModel, prospectData);
        return {
            success: true,
            message: 'Lead prospect created successfully.',
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