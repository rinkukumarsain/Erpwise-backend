const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {object} LeadContact
 * @property {string} name - The name of the lead contact.
 * @property {mongoose.Types.ObjectId} leadId - The ID of the associated lead (referenced from 'Lead' model).
 * @property {string} email - The email address of the lead contact.
 * @property {string} phone - The phone number of the lead contact.
 * @property {string} designation - The designation or role of the lead contact.
 * @property {string} country - The country of the lead contact.
 * @property {string} location - The location or address of the lead contact.
 * @property {string} activeDealings - The active dealings of the lead contact.
 * @property {boolean} isCustomerAccess - Indicates whether the lead contact has customer access.
 * @property {boolean} isActive - Indicates whether the lead contact is active.
 * @property {Date} createdAt - The timestamp when the document was created.
 * @property {Date} updatedAt - The timestamp when the document was last updated.
 */

/**
 * Mongoose schema for lead contact.
 * 
 * @type {mongoose.Schema<LeadContact>}
 */
const leadContactSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        leadId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Lead'
        },
        email: {
            type: String,
            required: true
        },
        phone: {
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
        location: {
            type: String,
            required: true
        },
        activeDealings: {
            type: String,
            default: ''
        },
        isCustomerAccess: {
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

module.exports = mongoose.model('LeadContact', leadContactSchema);