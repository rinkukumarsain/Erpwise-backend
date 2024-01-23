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
        leadId: {
            type: Schema.Types.ObjectId,
            ref: 'Lead'
        },
        stageName: {
            type: String,
            default: 'Create_Shipment'
        },
        organisationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Organisation',
            required: true
        },
        enquiryFinalItemId: [
            {
                type: Schema.Types.ObjectId,
                ref: 'EnquiryItem'
            }
        ],
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
            type: String,
            default: null
        },
        leadAddressId: {
            type: Schema.Types.ObjectId,
            ref: 'LeadAddress',
            default: null
        },
        shipToWarehouse: {
            type: String,
            default: null
        },
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: 'warehouse',
            default: null
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
        financeMeta: {
            type: new Schema(
                {
                    paymentTermsId: {
                        type: Schema.Types.ObjectId,
                        ref: 'PaymentTerms'
                    },
                    paymentTerms: {
                        type: Number,
                        default: 0
                    },
                    vatGroupId: {
                        type: Schema.Types.ObjectId,
                        // required: true,
                        ref: 'vat'
                    },
                    paymentOption: {
                        type: Number,
                        required: true
                    },
                    comment: {
                        type: String
                        // required: true,
                    },
                    deliveryTerm: {
                        type: Number,
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
