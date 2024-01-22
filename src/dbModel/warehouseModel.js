const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Warehouse Schema for MongoDB.
 *
 * @typedef {object} Warehouse
 * @property {string} name - The name of the warehouse (unique and required).
 * @property {string} Id - The unique identifier for the warehouse (required and unique).
 * @property {Array<mongoose.Types.ObjectId>} managers - An array of user IDs who manage the warehouse (referenced from 'User' model).
 * @property {string} email - The email address of the warehouse (required).
 * @property {string} mobile - The mobile number of the warehouse (default: '').
 * @property {string} mobileCode - The mobile code of the warehouse (default: '+91').
 * @property {string} buildingNo - The building number of the warehouse (default: '').
 * @property {string} area - The area where the warehouse is located (required).
 * @property {string} country - The country where the warehouse is located (required).
 * @property {string} state - The state where the warehouse is located (required).
 * @property {string} city - The city where the warehouse is located (required).
 * @property {string} pincode - The pincode of the warehouse (default: '').
 * @property {string} note - Additional notes or comments about the warehouse (default: null).
 * @property {mongoose.Types.ObjectId} organisationId - The ID of the organization to which the warehouse belongs (referenced from 'Organisation' model, required).
 * @property {mongoose.Types.ObjectId} createdBy - The ID of the user who created the warehouse.
 * @property {mongoose.Types.ObjectId} updatedBy - The ID of the user who last updated the warehouse (default: null).
 * @property {boolean} isActive - Indicates whether the warehouse is active (default: true).
 * @property {boolean} isDeleted - Indicates whether the warehouse is deleted (default: false).
 * @property {Date} createdAt - The timestamp when the warehouse was created.
 * @property {Date} updatedAt - The timestamp when the warehouse was last updated.
 */
const warehouseSchema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true
        },
        Id: {
            type: String,
            required: true,
            unique: true
        },
        managers: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        email: {
            type: String,
            required: true
        },
        mobile: {
            type: String,
            default: ''
        },
        mobileCode: {
            type: String,
            default: '+91'
        },
        buildingNo: {
            type: String,
            default: ''
        },
        area: {
            type: String,
            required: true
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
            type: String,
            default: ''
        },
        note: {
            type: String,
            default: null
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

module.exports = mongoose.model('warehouse', warehouseSchema);
