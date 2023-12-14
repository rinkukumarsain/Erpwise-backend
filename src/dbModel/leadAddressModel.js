const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {object} leadAddressSchema
 * @property {mongoose.Types.ObjectId} leadId - The ID of the lead (referenced from 'Lead' model).
 * @property {string} addresstype - The type of address.
 * @property {string} address - The main address information.
 * @property {string} street - The street name.
 * @property {string} [area] - The area information (optional).
 * @property {string} country - The country name.
 * @property {string} state - The state name.
 * @property {string} city - The city name.
 * @property {string} [pincode] - The postal code (optional).
 * @property {Date} createdAt - The timestamp when the document was created.
 * @property {Date} updatedAt - The timestamp when the document was last updated.
 */

/**
 * Mongoose schema for organisation address.
 *
 * @type {mongoose.Schema<leadAddressSchema>}
 */
const leadAddressSchema = new Schema(
    {
        leadId: {
            type: mongoose.Types.ObjectId,
            ref: 'Lead',
            required: true
        },
        addresstype: {
            type: String,
            required: true,
            enum: ['Billing', 'Business', 'Shipping']
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
        isDefault: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
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

module.exports = mongoose.model('LeadAddress', leadAddressSchema);
