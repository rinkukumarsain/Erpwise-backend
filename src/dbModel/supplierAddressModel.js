const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {object} SupplierAddress
 * @property {string} addresstype - The type of address, should be either 'Billing' or 'Shipment' (required).
 * @property {mongoose.Types.ObjectId} supplierId - The ID of the associated supplier (referenced from 'Supplier' model, required).
 * @property {string} address - The main address information (required).
 * @property {string} street - The street information (required).
 * @property {string} area - The area information.
 * @property {string} country - The country of the supplier address (required).
 * @property {string} state - The state of the supplier address (required).
 * @property {string} city - The city of the supplier address (required).
 * @property {string} pincode - The pin code or postal code of the supplier address.
 * @property {mongoose.Types.ObjectId} createdBy - The user ID who created the supplier address (referenced from 'User' model).
 * @property {mongoose.Types.ObjectId} updatedBy - The user ID who last updated the supplier address (referenced from 'User' model, default: null).
 * @property {boolean} isActive - Indicates whether the supplier address is active (default: true).
 * @property {boolean} isDeleted - Indicates whether the supplier address is deleted (default: false).
 */

/**
 * Mongoose schema for supplier addresses.
 *
 * @type {mongoose.Schema<SupplierAddress>}
 */
const supplierAddressSchema = new Schema(
    {
        addresstype: {
            type: String,
            enum: ['Billing', 'Shipment'],
            required: true
        },
        supplierId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Supplier'
        },
        address: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        area: {
            type: String
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
        pincode: {
            type: String
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
        isDefault: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('SupplierAddress', supplierAddressSchema);