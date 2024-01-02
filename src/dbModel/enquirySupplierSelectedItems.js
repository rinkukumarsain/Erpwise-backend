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
        },
        financeMeta: {
            type: new Schema(
                {
                    paymentTermsId: {
                        type: Schema.Types.ObjectId,
                        ref: 'PaymentTerms'
                    },
                    vatGroupId: {
                        type: Schema.Types.ObjectId,
                        // required: true,
                        ref: 'vat'
                    },
                    paymentOption: {
                        type: String,
                        required: true
                    },
                    comment: {
                        type: String
                        // required: true,
                    },
                    supplierTotal: {
                        type: String,
                        required: true
                    },
                    freightCharges: {
                        type: String,
                        default: '0'
                    },
                    packingCharges: {
                        type: String,
                        default: '0'
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
                    currency: {
                        type: mongoose.Types.ObjectId,
                        ref: 'Currency'
                    }

                },
                { _id: false }
            )
        },
        itemsSheet: {
            type: String,
            default: null
        },
        finalItemDetails: {
            type: new Schema(
                {
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
                    quantity: {
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
                    total: {
                        type: String,
                        required: true
                    },
                    createdBy: {
                        type: mongoose.Types.ObjectId,
                        ref: 'User'
                    }

                },
                { _id: false }
            )
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('EnquirySupplierSelectedItem', EnquirySupplierSelectedItemSchema);