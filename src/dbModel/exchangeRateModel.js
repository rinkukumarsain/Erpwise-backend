const mongoose = require('mongoose');
const { Schema } = mongoose;

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
            type: String,
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
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    Activity: [userActionSchema]
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('exchangeRate', exchangeRateSchema);
