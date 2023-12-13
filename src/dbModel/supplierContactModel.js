const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {object} SupplierContact
 * @property {string} name - The name of the supplier contact (required).
 * @property {mongoose.Types.ObjectId} supplierId - The ID of the associated supplier (referenced from 'Supplier' model, required).
 * @property {string} email - The email address of the supplier contact (required).
 * @property {string} phone - The phone number of the supplier contact (required).
 * @property {string} xerocontactid - The Xero contact ID of the supplier contact (required).
 * @property {string} address1 - The first line of the address (required).
 * @property {string} address2 - The second line of the address (required).
 * @property {string} designation - The designation or role of the supplier contact (required).
 * @property {string} country - The country of the supplier contact (required).
 * @property {string} state - The state of the supplier contact (required).
 * @property {string} city - The city of the supplier contact (required).
 * @property {string} pinCode - The pin code or postal code of the supplier contact (required).
 * @property {mongoose.Types.ObjectId} createdBy - The user ID who created the supplier contact (referenced from 'User' model).
 * @property {mongoose.Types.ObjectId} updatedBy - The user ID who last updated the supplier contact (referenced from 'User' model, default: null).
 * @property {boolean} isActive - Indicates whether the supplier contact is active (default: true).
 */

/**
 * Mongoose schema for supplier contacts.
 *
 * @type {mongoose.Schema<SupplierContact>}
 */
const supplierContactSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        supplierId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Supplier'
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        xerocontactid: {
            type: String,
            required: true
        },
        address1: {
            type: String,
            required: true
        },
        address2: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        pinCode: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        updatedBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('SupplierContact', supplierContactSchema);