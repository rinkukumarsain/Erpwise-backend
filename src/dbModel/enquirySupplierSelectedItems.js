const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EnquirySupplierSelectedItemSchema = new Schema(
    {
        enquiryId: {
            type: mongoose.Types.ObjectId,
            ref: 'Enquiry'
        },
        enquiryItemId: {
            type: mongoose.Types.ObjectId,
            ref: 'EnquiryItem'
        },
        supplierId: {
            type: mongoose.Types.ObjectId,
            ref: 'Supplier'
        },
        supplierItemId: {
            type: mongoose.Types.ObjectId,
            ref: 'SupplierItem'
        },
        supplierContactId: {
            type: mongoose.Types.ObjectId,
            ref: 'SupplierContact'
        },
        currency: {
            type: mongoose.Types.ObjectId,
            ref: 'Currency'
        },
        quantity: {
            type: String,
            required: true
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
        isMailSent: {
            type: Boolean,
            default: false
        },
        isSkipped: {
            type: Boolean,
            default: false
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

module.exports = mongoose.model('EnquirySupplierSelectedItem', EnquirySupplierSelectedItemSchema);