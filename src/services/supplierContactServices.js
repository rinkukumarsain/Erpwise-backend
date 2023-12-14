const moment = require('moment');
// Local Import
// const { rolesKeys } = require('../../config/default.json');
const { supplierModel, supplierContactModel } = require('../dbModel');
// const { registerUser } = require('./userService');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/supplierContactService';

/**
 * Creates a new supplier contact.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} supplierContactData - Data for creating a new supplier contact.
 * @returns {object} - An object with the results, including the new supplier contact.
 */
exports.createSupplierContact = async (auth, supplierContactData) => {
    try {
        const { email, _id } = auth;

        const findSupplier = await query.findOne(supplierModel, { _id: supplierContactData.supplierId, isActive: true, isDeleted: false });
        // console.log('findSupplier>>>>>>>>>>>>>', findSupplier);
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }

        const findUniqueName = await query.findOne(supplierContactModel, { name: supplierContactData.name });
        if (findUniqueName) {
            return {
                success: false,
                message: 'Supplier contact name already exist.'
            };
        }
        const findUniqueEmail = await query.findOne(supplierContactModel, { email: supplierContactData.email });
        if (findUniqueEmail) {
            return {
                success: false,
                message: 'Supplier contact email already exist.'
            };
        }
        const findUniquePhone = await query.findOne(supplierContactModel, { phone: supplierContactData.phone });
        if (findUniquePhone) {
            return {
                success: false,
                message: 'Supplier contact phone already exist.'
            };
        }
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Supplier contact creation by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findSupplier.Activity.push(obj);
        const newsupplierContact = await query.create(supplierContactModel, supplierContactData);
        if (newsupplierContact) {
            await supplierModel.updateOne({ _id: supplierContactData.supplierId }, { Activity: findSupplier.Activity, isContactAdded: true });
            return {
                success: true,
                message: 'Supplier contact created successfully.',
                data: newsupplierContact
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error creating Supplier contact: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Updates a Supplier contact by ID.
 *
 * @param {string} auth - req.auth.
 * @param {string} _id - The ID of the Supplier contact be updated.
 * @param {string} body - Updated data for the Supplier contact.
 * @returns {object} - An object with the results, including updated Supplier contact.
 */
exports.updateSupplierContactById = async (auth, _id, body) => {
    try {
        const findData = await query.findOne(supplierContactModel, { _id, isActive: true, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Supplier Contact not found.'
            };
        }
        const findSupplier = await query.findOne(supplierModel, { _id: findData.supplierId, isActive: true, isDeleted: false });
        // console.log('findSupplier>>>>>>>>>>>>>', findSupplier);
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }

        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier contact update by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findSupplier.Activity.push(obj);
        const data = await supplierContactModel.findByIdAndUpdate(_id, body, { new: true, runValidators: true });
        if (data) {
            await supplierModel.updateOne({ _id: findSupplier._id }, { Activity: findSupplier.Activity });
            return {
                success: true,
                message: 'Supplier contact updated successfully.',
                data
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error updating Supplier contact: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Deletes a Supplier contact by ID.
 *
 * @param {string} auth - req.auth.
 * @param {string} _id - The ID of the Supplier Contact to be deleted.
 * @returns {object} - An object with the results, including the deleted Supplier Contact.
 */
exports.delete = async (auth, _id) => {
    try {
        const findData = await query.findOne(supplierContactModel, { _id, isActive: true, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Supplier Contact not found.'
            };
        }

        const findSupplier = await query.findOne(supplierModel, { _id: findData.supplierId, isActive: true, isDeleted: false });
        // console.log('findSupplier>>>>>>>>>>>>>', findSupplier);
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        const data = await supplierContactModel.findByIdAndUpdate(_id, { isDeleted: true });
        if (!data) {
            return {
                success: false,
                message: 'Supplier Contact not found.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier contact deleted by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findSupplier.Activity.push(obj);
        await supplierModel.updateOne({ _id: findSupplier._id }, { Activity: findSupplier.Activity });
        return {
            success: true,
            message: 'Supplier Contact deleted successfully.'
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
 * Updates a Supplier contact by ID.
 *
 * @param {string} auth - The ID of the Supplier to be updated.
 * @param {string} _id - The ID of the Supplier  be updated.
 * @param {string} body - Updated data for the Supplier contact.
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including updated Supplier contact.
 */
// exports.SupplierContactCustomerAccess = async (auth, _id, { isCustomerAccess }, orgId) => {
//     try {
//         const findData = await query.findOne(supplierContactModel, { _id, isActive: true });
//         if (!findData) {
//             return {
//                 success: false,
//                 message: 'Supplier Contact not found.'
//             };
//         }
//         const data = await supplierContactModel.findByIdAndUpdate(_id, { isCustomerAccess }, { new: true, runValidators: true });
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
//                 message: 'Supplier contact updated successfully.',
//                 data
//             };
//         }
//     } catch (error) {
//         logger.error(LOG_ID, `Error updating Supplier: ${error}`);
//         return {
//             success: false,
//             message: 'Something went wrong'
//         };
//     }
// };
