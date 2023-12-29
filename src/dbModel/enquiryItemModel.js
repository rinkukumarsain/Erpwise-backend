const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EnquiryItemSchema = new Schema(
    {
        enquiryId: {
            type: mongoose.Types.ObjectId,
            ref: 'Enquiry'
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
            required: true
        },
        // supplierId: {
        //     type: mongoose.Types.ObjectId,
        //     ref: 'Supplier'
        // },
        // supplierItemId: {
        //     type: mongoose.Types.ObjectId,
        //     ref: 'SupplierItem'
        // },
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

module.exports = mongoose.model('EnquiryItem', EnquiryItemSchema);