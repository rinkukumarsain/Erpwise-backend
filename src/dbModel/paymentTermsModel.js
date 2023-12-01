const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {object} PaymentTerms
 * @property {string} name - The name of the paymentTerms.
 * @property {number} noOfDays - The number of days associated with the paymentTerms.
 * @property {boolean} isActive - Indicates whether the paymentTerms is active.
 * @property {Date} createdAt - The timestamp when the document was created.
 * @property {Date} updatedAt - The timestamp when the document was last updated.
 */

/**
 * Mongoose schema for payment term.
 *
 * @type {mongoose.Schema<PaymentTerms>}
 */
const paymentTermsSchema = new Schema(
    {
        name: {
            type: String,
            default: ''
        },
        noOfDays: {
            type: Number,
            default: 0
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

module.exports = mongoose.model('PaymentTerms', paymentTermsSchema);
