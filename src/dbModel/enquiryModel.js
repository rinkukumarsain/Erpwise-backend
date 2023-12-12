const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema definition for user actions.
 *
 * @typedef {object} UserAction
 * @property {string} performedBy - The user ID who performed the action.
 * @property {string} performedByEmail - The email of the user who performed the action.
 * @property {string} actionName - The name or description of the action performed.
 * @property {Date} dateTime - The timestamp when the action was performed. Defaults to the current date and time.
 */

/**
 * Mongoose schema for user actions.
 *
 * @type {mongoose.Schema<UserAction>}
 */
const userActionSchema = new Schema(
    {
        performedBy: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        performedByEmail: {
            type: String,
            required: true
        },
        actionName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/**
 * Schema definition for enquiries.
 *
 * @typedef {object} Enquiry
 * @property {string} companyName - The name of the company associated with the enquiry.
 * @property {string} Id - The unique identifier for the enquiry.
 * @property {string} contactPerson - The name of the contact person associated with the enquiry.
 * @property {string} email - The email address associated with the enquiry.
 * @property {string} phone - The phone number associated with the enquiry.
 * @property {mongoose.Types.ObjectId} salesPerson - The ID of the salesperson (referenced from 'User' model).
 * @property {string} totalOrderValue - The total order value for the enquiry.
 * @property {Date} enquiryDate - The date when the enquiry was made.
 * @property {string} note - Additional notes or comments about the enquiry.
 * @property {mongoose.Types.ObjectId} organisationId - The ID of the organisation (referenced from 'Organisation' model).
 * @property {mongoose.Types.ObjectId} currency - The ID of the currency (referenced from 'Currency' model).
 * @property {mongoose.Types.ObjectId} createdBy - The ID of the user who created the enquiry (referenced from 'User' model).
 * @property {mongoose.Types.ObjectId} updatedBy - The ID of the user who last updated the enquiry (referenced from 'User' model).
 * @property {Array} Activity - An array of user actions associated with the enquiry.
 * @property {boolean} isActive - Indicates whether the enquiry is active.
 * @property {Date} createdAt - The timestamp when the enquiry was created.
 * @property {Date} updatedAt - The timestamp when the enquiry was last updated.
 */

/**
 * Mongoose schema for enquiries.
 *
 * @type {mongoose.Schema<Enquiry>}
 */
const enquirySchema = new Schema(
    {
        companyName: {
            type: String,
            required: true
        },
        Id: {
            type: String,
            required: true
        },
        contactPerson: {
            type: String,
            required: true
        },
        salesPerson: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        totalOrderValue: {
            type: String,
            required: true
        },
        enquiryDate: {
            type: Date,
            required: true
        },
        note: {
            type: String,
            required: true
        },
        organisationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Organisation',
            required: true
        },
        leadId: {
            type: mongoose.Types.ObjectId,
            ref: 'Lead',
            required: true
        },
        leadContactId: {
            type: mongoose.Types.ObjectId,
            ref: 'Lead',
            required: true
        },
        currency: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Currency'
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
        Activity: [userActionSchema],
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

module.exports = mongoose.model('Enquiry', enquirySchema);