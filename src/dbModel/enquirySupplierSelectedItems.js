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
            ref: 'SupplierContact',
            default: null
        },
        currency: {
            type: mongoose.Types.ObjectId,
            ref: 'Currency',
            default: null
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
                    deliveryTerm: {
                        type: String,
                        default: null
                    },
                    supplierTotal: {
                        type: Number,
                        required: true
                    },
                    freightCharges: {
                        type: Number,
                        default: 0
                    },
                    packingCharges: {
                        type: Number,
                        default: 0
                    },
                    vatGroupValue: {
                        type: Number,
                        default: 0
                    },
                    vatGroupValueConverted: {
                        type: Number,
                        default: 0
                    },
                    supplierTotalConverted: {
                        type: Number,
                        required: true
                    },
                    freightChargesConverted: {
                        type: Number,
                        required: true
                    },
                    packingChargesConverted: {
                        type: Number,
                        required: true
                    },
                    convertedToCurrency: {
                        type: Schema.Types.ObjectId,
                        ref: 'currency'
                    },
                    currencyExchangeRate: {
                        type: Number,
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
                    currency: {
                        type: mongoose.Types.ObjectId,
                        ref: 'Currency'
                    }

                },
                { _id: false }
            ),
            default: null
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
            ),
            default: null
        },
        isShortListed: {
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