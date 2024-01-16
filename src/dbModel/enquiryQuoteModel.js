const mongoose = require('mongoose');
const { Schema } = mongoose;

const enquiryQuoteSchema = new Schema(
    {
        Id: {
            type: String,
            required: true
        },
        html: {
            type: String,
            default: null
        },
        note: {
            type: String,
            default: null
        },
        enquiryId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Enquiry'
        },
        enquiryFinalItemId: [
            {
                type: Schema.Types.ObjectId,
                ref: 'EnquiryItem'
            }
        ],
        vatGroupId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'vat'
        },
        vatGroup: {
            type: Number,
            default: 0
        },
        margin: {
            type: Number,
            default: 0
        },
        freightCharges: {
            type: Number,
            default: 0
        },
        packingCharges: {
            type: Number,
            default: 0
        },
        miscCharges: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        agentTotalCommission: {
            type: Number,
            default: 0
        },
        duedate: {
            type: Date,
            required: true
        },
        organisationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Organisation',
            required: true
        },
        currency: {
            type: mongoose.Types.ObjectId,
            // required: true,
            default: null,
            ref: 'Currency'
        },
        addedFreightCharges: {
            type: Number,
            default: 0
        },
        addedSupplierTotal: {
            type: Number,
            default: 0
        },
        addedPackingCharges: {
            type: Number,
            default: 0
        },
        addedSupplierFinalTotal: {
            type: Number,
            default: 0
        },
        addedVatGroupValue: {
            type: Number,
            default: 0
        },
        subTotal: {
            type: Number,
            default: 0
        },
        vatGroupValue: {
            type: Number,
            default: 0
        },
        discountValue: {
            type: Number,
            default: 0
        },
        marginValue: {
            type: Number,
            default: 0
        },
        agentTotalCommissionValue: {
            type: Number,
            default: 0
        },
        currencyExchangeRate: {
            type: Number,
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

module.exports = mongoose.model('enquiryQuote', enquiryQuoteSchema);
