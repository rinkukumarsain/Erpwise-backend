const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {object} Organisation
 * @property {string} [image] - URL or path to the organisation's image.
 * @property {string} companyName - The name of the company (must be unique).
 * @property {string} [website] - The website URL of the organisation.
 * @property {string} email - The email address of the organisation.
 * @property {string} [phone] - The phone number of the organisation.
 * @property {string} [industryType] - The industry type of the organisation.
 * @property {mongoose.Types.ObjectId} [currency] - The ID of the currency (referenced from 'currency' model).
 * @property {Array} [documents] - An array of documents associated with the organisation.
 * @property {mongoose.Types.ObjectId[]} [organisationAddress] - An array of organisation address IDs (referenced from 'organisationAddress' model).
 * @property {number} address_count - The count of organisation addresses.
 * @property {Date} createdAt - The timestamp when the document was created.
 * @property {Date} updatedAt - The timestamp when the document was last updated.
 */

/**
 * Mongoose schema for organisation.
 *
 * @type {mongoose.Schema<Organisation>}
 */
const organisationSchema = new Schema(
    {
        image: {
            type: String
        },
        companyName: {
            type: String,
            unique: true,
            required: true
        },
        website: {
            type: String
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        industryType: {
            type: String
        },
        currency: {
            type: mongoose.Types.ObjectId,
            ref: 'currency'
        },
        documents: {
            type: Array
        },
        organisationAddress: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'organisationAddress'
            }
        ],
        address_count: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('Organisation', organisationSchema);
