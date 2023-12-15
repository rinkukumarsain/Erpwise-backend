const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supplierItemSchema = new Schema(
    {
        supplierId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Supplier'
        },
        partNumber: {
            type: String,
            required: true
        },
        partDesc: {
            type: String,
            required: true
        },
        unitPrice: {
            type: String,
            required: true
        },
        delivery: {
            type: String,
            required: true
        },
        notes: {
            type: String,
            default: null
        },
        hscode: {
            type: String,
            default: null
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

module.exports = mongoose.model('SupplierItem', supplierItemSchema);