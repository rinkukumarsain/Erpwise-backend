const mongoose = require('mongoose');
const { Schema } = mongoose;

const enquirySupplierPOSchema = new Schema(
    {
        Id: {
            type: String,
            required: true
        },
        enquiryId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Enquiry'
        },
        supplierId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Supplier'
        },
        supplierAddressId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'SupplierAddress'
        },
        supplierAddress: {
            type: String,
            required: true
        },
        shipTo: {
            type: String,
            required: true,
            enum: ['customer', 'warehouse', 'fob/exw']
        },
        shipToCustomer: {
            type: Schema.Types.ObjectId,
            ref: 'LeadAddress'
        },
        shipToWarehouse: {
            type: Schema.Types.ObjectId,
            ref: 'warehouse'
        },
        deliveryPoint: {
            type: Number,
            default: 0
        },
        supplierPODate: {
            type: Date,
            required: true
        },
        validTillDate: {
            type: Date,
            required: true
        },
        packing: {
            type: String,
            required: true
        },
        commodity: {
            type: String,
            required: true
        },
        paymentTermsId: {
            type: Schema.Types.ObjectId,
            ref: 'PaymentTerms',
            required: true
        },
        paymentTerms: {
            type: Number,
            required: true
        },
        documents: {
            type: Array
        },
        supplierOrderConfirmation: {
            type: String,
            required: true
        },
        notes: {
            type: String,
            default: null
        },
        additionalNotes: {
            type: String,
            default: null
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

module.exports = mongoose.model('enquirySupplierPO', enquirySupplierPOSchema);
