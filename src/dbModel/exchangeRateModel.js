const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {object} exchangeRate
 * @property {mongoose.Types.ObjectId} [orgId] - The orgId of organisations.
 * @property {mongoose.Types.ObjectId} [orgCurrency] - The ID of organisations currency id.
 * @property {Date} [startDate] - The startDate of the exchangeRate.
 * @property {Date} [endDate] - The endDate of the exchangeRate.
 * @property {Number} [currencyRate] - The currency rate of the exchange
 * @property {Date} createdAt - The timestamp when the exchangeRate was created.
 * @property {Date} updatedAt - The timestamp when the exchangeRate was last updated.
 */

/**
 * Mongoose schema for exchangeRate.
 *
 * @type {mongoose.Schema<exchangeRate>}
 */
const exchangeRateSchema = new Schema({
    orgId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    orgCurrency: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        unique: true
    },
    endDate: {
        type: Date,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    currencyRate: {
        type: [{
            currencyRate: { type: Number },
            currencyId: { type: mongoose.Types.ObjectId }
        }]
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('exchangeRate', exchangeRateSchema);
