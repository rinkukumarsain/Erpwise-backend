const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema for MongoDB.
 *
 * @typedef {object} Currency
 * @property {string} currencyName - The unique name of the Currency.
 * @property {string} currencySymbol - The unique symbol of the Currency.
 * @property {string} currencyShortForm - The unique short form of the Currency.
 * @property {string} isActive - The Currency's status (default is true).
 */
const currencySchema = new Schema(
    {
        currencyName: {
            type: String,
            required: true,
            unique: true
        },
        currencySymbol: {
            type: String,
            required: true
        },
        currencyShortForm: {
            type: String,
            required: true,
            unique: true
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

module.exports = mongoose.model('Currency', currencySchema);