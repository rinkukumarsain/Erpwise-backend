const moment = require('moment');
// Local Import
// const { rolesKeys } = require('../../config/default.json');
const { leadModel, leadContactModel, enquiryModel } = require('../dbModel');
// const { registerUser } = require('./userService');
// const { leadDao } = require('../dao');
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

        const findUniqueName = await query.findOne(leadContactModel, { name: leadContactData.name });
        if (findUniqueName) {
            return {
                success: false,
                message: 'Lead contact name already exist.'
            };
        }
        const findUniqueEmail = await query.findOne(leadContactModel, { email: leadContactData.email });
        if (findUniqueEmail) {
            return {
                success: false,
                message: 'Lead contact email already exist.'
            };
        }
        const findUniquePhone = await query.findOne(leadContactModel, { phone: leadContactData.phone });
        if (findUniquePhone) {
            return {
                success: false,
                message: 'Lead contact phone already exist.'
            };
        }
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Lead contact creation by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
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
 * Updates a Lead contact by ID.
 *
 * @param {string} auth - The ID of the Lead to be updated.
 * @param {string} _id - The ID of the Lead  be updated.
 * @param {string} body - Updated data for the Lead contact.
 * @returns {object} - An object with the results, including updated Lead contact.
 */
exports.updateLeadContactById = async (auth, _id, body) => {
    try {
        const findData = await query.findOne(leadContactModel, { _id, isActive: true, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Lead Contact not found.'
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
            actionName: `Lead contact update  by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
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
 * Deletes a Lead Contact by ID.
 *
 * @param {string} auth - req.auth.
 * @param {string} _id - The ID of the Lead Contact to be deleted.
 * @returns {object} - An object with the results, including the deleted Lead Contact.
 */
exports.delete = async (auth, _id) => {
    try {
        const findData = await query.findOne(leadContactModel, { _id, isActive: true, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Lead Contact not found.'
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
        const findEnquiryData = await query.find(enquiryModel, { leadContactId: _id, isDeleted: false });
        if (findEnquiryData.length > 0) {
            return {
                success: false,
                message: 'This lead contact cannot be deleted due to its association with an active enquiry.'
            };
        }

        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Lead contact deleted by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findLead.Activity.push(obj);
        const data = await leadContactModel.findByIdAndUpdate(_id, { isDeleted: true }, { new: true, runValidators: true });
        if (data) {
            await leadModel.updateOne({ _id: findLead._id }, { Activity: findLead.Activity });
            return {
                success: true,
                message: 'Lead contact deleted successfully.',
                data
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error deleting lead contact: ${error}`);
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
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including updated Lead contact.
 */
// exports.leadContactCustomerAccess = async (auth, _id, { isCustomerAccess }, orgId) => {
//     try {
//         const findData = await query.findOne(leadContactModel, { _id, isActive: true });
//         if (!findData) {
//             return {
//                 success: false,
//                 message: 'Lead Contact not found.'
//             };
//         }
//         const data = await leadContactModel.findByIdAndUpdate(_id, { isCustomerAccess }, { new: true, runValidators: true });
//         // let val;
//         if (isCustomerAccess) {
//             let obj = {
//                 'name': findData.name,
//                 'email': findData.email,
//                 'employeeId': `EMP-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`,
//                 'role': rolesKeys['1'],
//                 'password': btoa(findData.name),
//                 'createdBy': '6566f24b14a3b6d4df41c747',
//                 'mobile': findData.phone,
//                 'jobTitle': null,
//                 'organisationId': orgId,
//                 'isActive': true
//             };
//             val = await registerUser(auth, obj);
//         } else {

//         }
//         if (data) {
//             return {
//                 success: true,
//                 message: 'Lead contact updated successfully.',
//                 data
//             };
//         }
//     } catch (error) {
//         logger.error(LOG_ID, `Error updating Lead: ${error}`);
//         return {
//             success: false,
//             message: 'Something went wrong'
//         };
//     }
// };
