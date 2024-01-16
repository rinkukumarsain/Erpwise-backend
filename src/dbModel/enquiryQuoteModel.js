const mongoose = require('mongoose');
const { Schema } = mongoose;

const enquiryQuoteSchema = new Schema(
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
        enquiryFinalItemId: [
            {
                type: Schema.Types.ObjectId,
                ref: 'EnquiryItem'
            }
        ],
        paymentTermsId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'PaymentTerms'
        },
        vatGroupId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'vat'
        },
        vatGroup: {
            type: Number,
            default: 0
        },
        ourMargin: {
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
            required: true,
            ref: 'Currency'
        },
        currencyExchangeRate: {
            type: Number,
            default: 0
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
