const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Enquiry Item Shipment Schema for MongoDB.
 *
 * @typedef {object} EnquiryItemShipment
 * @property {string} Id - The unique identifier for the item shipment (required and unique).
 * @property {mongoose.Types.ObjectId} enquiryId - The ID of the associated enquiry (referenced from 'Enquiry' model, required).
 * @property {mongoose.Types.ObjectId} supplierPoId - The ID of the associated supplier purchase order (referenced from 'EnquirySupplierPO' model, required).
 * @property {mongoose.Types.ObjectId} supplierId - The ID of the supplier (referenced from 'Supplier' model, required).
 * @property {Schema.Types.ObjectId} enquiryFinalItemId - The ID of the associated final item in the enquiry (referenced from 'EnquirySupplierSelectedItem' model, required).
 * @property {string} partNumber - The part number of the item (required).
 * @property {string} partNumberCode - The part number code of the item (required).
 * @property {string} partDesc - The description of the item (required).
 * @property {string} unitPrice - The unit price of the item (required).
 * @property {string} quantity - The total quantity of the item (required).
 * @property {number} shipQuantity - The shipped quantity of the item (required).
 * @property {number} totalPrice - The total price of the item (required).
 * @property {boolean} isActive - Indicates whether the item shipment is active (default: true).
 * @property {boolean} isDeleted - Indicates whether the item shipment is deleted (default: false).
 * @property {Date} createdAt - The timestamp when the item shipment was created.
 * @property {Date} updatedAt - The timestamp when the item shipment was last updated.
 */
const enquiryitemshippmentSchema = new Schema(
    {
        Id: {
            type: String,
            required: true,
            unique: true
        },
        enquiryId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquiry',
            required: true
        },
        supplierPoId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquirySupplierPO',
            required: true
        },
        supplierId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Supplier'
        },
        enquiryFinalItemId: {
            type: Schema.Types.ObjectId,
            ref: 'EnquirySupplierSelectedItem',
            required: true
        },
        partNumber: {
            type: String,
            required: true
        },
        partNumberCode: {
            type: String,
            required: true
        },
        partDesc: {
            type: String,
            required: true
        },
        unitPrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        shipQuantity: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
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

module.exports = mongoose.model('enquiryitemshippment', enquiryitemshippmentSchema);