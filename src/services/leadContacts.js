const moment = require('moment');
// Local Import
const { rolesKeys } = require('../../config/default.json');
const { leadModel, leadContactModel, enquiryModel, userModel, mailLogsModel } = require('../dbModel');
const { registerUser } = require('./userService');
// const { leadDao } = require('../dao');
const { sendMail } = require('../utils/sendMail');
const { giveLeadContactLoginAccess } = require('../utils/html');
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

        const findLead = await query.findOne(leadModel, { _id: leadContactData.leadId, isDeleted: false });
        // console.log('findLead>>>>>>>>>>>>>', findLead);
        if (!findLead) {
            return {
                success: false,
                message: 'Lead not found.'
            };
        }

        if(!findLead.isActive){
            return {
                success:false,
                message:'Lead is not active right now, please activate the lead first to proceed further.'
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
exports.leadContactCustomerAccess = async (auth, _id, { isCustomerAccess }, orgId) => {
    try {
        const findData = await query.findOne(leadContactModel, { _id, isActive: true });
        if (!findData) {
            return {
                success: false,
                message: 'Lead Contact not found.'
            };
        }

        let val;
        if (isCustomerAccess) {
            const pass = `EMPUSER@${Math.floor(999 + Math.random() * 99)}`;
            const name = findData.name.split(' ');
            let obj = {
                'fname': name[0],
                'lname': name[1] || '-',
                'email': findData.email,
                'employeeId': `EMP-CUST-${Math.floor(10 + Math.random() * 90)}`,
                'role': rolesKeys['1'],
                'password': pass,
                'createdBy': '6566f24b14a3b6d4df41c747',
                'mobile': findData.phone,
                'jobTitle': null,
                'organisationId': orgId,
                'isActive': true
            };
            val = await registerUser(auth, obj);
            if (!val.success) {
                return val;
            }
            const mailDetails = {
                leadContactId: findData._id,
                leadId: findData.leadId,
                type: 'leadContactCustomerLoginAccess'
            };
            sendMailFun(
                findData.email,
                'Welcome To ERPWISE',
                giveLeadContactLoginAccess(findData.name, pass, process.env.FRONTEND_URL, process.env.EMAIL1),
                mailDetails
            );
        } else {
            const findUser = await userModel.deleteOne({ email: findData.email });
            if (!findUser) {
                return {
                    success: false,
                    message: `Error removing customer login access.`
                };
            }
        }
        const data = await leadContactModel.findByIdAndUpdate(_id, { isCustomerAccess }, { new: true, runValidators: true });
        if (data) {
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
 * Function to send mail.
 *
 * @param {string} to - Send email to.
 * @param {string} subject - Send email subject.
 * @param {string} body - email body.
 * @param {object} mailDetailData - email extra details.
 * @returns {Promise<void>} - A Promise that resolves after operation.
 */
async function sendMailFun(to, subject, body, mailDetailData) {
    try {
        const mailCred = {
            email: process.env.EMAIL1,
            password: process.env.PASS1,
            host: process.env.HOST,
            port: 465,
            secure: true
        };
        const mailDetails = {
            to,
            cc: '',
            subject,
            body,
            attachments: []
        };
        const nodemailerResponse = await sendMail(mailCred, mailDetails);
        await query.create(mailLogsModel, {
            to,
            from: mailCred.email,
            subject,
            body,
            documents: [],
            mailDetails: mailDetailData,
            nodemailerResponse
        });
    } catch (error) {
        logger.error(LOG_ID, `Error while sending mail TYPE:- (${mailDetailData.type}) : ${error}`);
    }
}
