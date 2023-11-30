const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {Object} vatSchema
 * @property {string} name - The name of the vat.
 * @property {number} percentage - The percentage associated with the vat.
 * @property {boolean} isActive - Indicates whether the vat is active.
 * @property {Date} createdAt - The timestamp when the document was created.
 * @property {Date} updatedAt - The timestamp when the document was last updated.
 */

/**
 * Mongoose schema for vat.
 * @type {mongoose.Schema<Vat>}
 */
const vatSchema = new Schema(
    {
        name: {
            type: String,
            default: '',
        },
        percentage: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('vat', vatSchema);
