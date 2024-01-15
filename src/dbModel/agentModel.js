const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema definition for an agent.
 *
 * @typedef {object} Agent
 * @property {string} name - The name of the agent.
 * @property {string} Id - The unique identifier for the agent.
 * @property {string} email - The email address of the agent (must be unique).
 * @property {string} mobile - The mobile number of the agent (default is an empty string).
 * @property {string} mobileCode - The country code for the mobile number (default is '+91').
 * @property {mongoose.Types.ObjectId} paymentTermsId - The ID of the payment terms (referenced from 'PaymentTerms' model).
 * @property {mongoose.Types.ObjectId} vatGroupId - The ID of the VAT group (referenced from 'vat' model).
 * @property {string} note - Additional notes or comments about the agent (default is null).
 * @property {string} billingAdd1 - The first line of the billing address.
 * @property {string} billingAdd2 - The second line of the billing address (default is null).
 * @property {string} city - The city of the agent.
 * @property {string} state - The state of the agent.
 * @property {string} country - The country of the agent.
 * @property {string} pincode - The pin code of the agent.
 * @property {boolean} isActive - Indicates whether the agent is active (default is true).
 * @property {boolean} isDeleted - Indicates whether the agent is deleted (default is false).
 */

/**
 * Mongoose schema for an agent.
 *
 * @type {mongoose.Schema<Agent>}
 */
const agentSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        Id: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        mobile: {
            type: String,
            default: ''
        },
        mobileCode: {
            type: String,
            default: '+91'
        },
        paymentTermsId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'PaymentTerms'
        },
        vatGroupId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'vat'
        },
        note: {
            type: String,
            default: null
        },
        billingAdd1: {
            type: String,
            required: true
        },
        billingAdd2: {
            type: String,
            default: null
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        organisationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Organisation',
            required: true
        },
        createdBy: {
            type: mongoose.Types.ObjectId
        },
        updatedBy: {
            type: mongoose.Types.ObjectId,
            default: null
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

module.exports = mongoose.model('agent', agentSchema);
