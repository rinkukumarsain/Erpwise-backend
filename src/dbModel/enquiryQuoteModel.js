const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {object} UserAction
 * @property {mongoose.Types.ObjectId} enquiryId - The ID of enquiry.
 * @property {mongoose.Types.ObjectId} agentId - The ID of enquiry.
 * @property {number} commission - The commission that a agent will get in %.
 * @property {number} commissionValue - The value of commission.
 * @property {string} notes - description.
 * @property {boolean} agentBill - boolean.
 * @property {Date} createdAt - The timestamp when the document was created.
 * @property {Date} updatedAt - The timestamp when the document was last updated.
 */

/**
 * Mongoose schema for user actions.
 *
 * @type {mongoose.Schema<UserAction>}
 */
const AgentCommissionSchema = new Schema(
    {
        enquiryId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquiry',
            required: true
        },
        agentId: {
            type: mongoose.Types.ObjectId,
            ref: 'agent',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        commission: {
            type: Number,
            required: true
        },
        commissionValue: {
            type: Number,
            required: true
        },
        notes: {
            type: String,
            default: null
        },
        agentBill: {
            type: Boolean,
            defalut: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/**
 * Mongoose schema for user actions.
 *
 * @type {mongoose.Schema<UserAction>}
 */
const ReminderSchema = new Schema(
    {
        subject: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        createdByName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

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
        leadId: {
            type: mongoose.Types.ObjectId,
            ref: 'Lead',
            required: true
        },
        leadContactId: {
            type: mongoose.Types.ObjectId,
            ref: 'LeadContact',
            required: true
        },
        enquiryFinalItemId: [
            {
                type: Schema.Types.ObjectId,
                ref: 'EnquiryItem'
            }
        ],
        vatGroupId: {
            type: Schema.Types.ObjectId,
            // required: true,
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
        totalQuote: {
            type: Number,
            default: 0
        },
        finalQuote: {
            type: Number,
            default: 0
        },
        currencyExchangeRate: {
            type: Number,
            default: null
        },
        AgentCommission: [AgentCommissionSchema],
        createdBy: {
            type: mongoose.Types.ObjectId
        },
        updatedBy: {
            type: mongoose.Types.ObjectId,
            default: null
        },
        paymentOption: {
            type: String,
            required: true
        },
        deliveryTerm: {
            type: Number,
            required: true
        },
        paymentTermsId: {
            type: Schema.Types.ObjectId,
            ref: 'PaymentTerms',
            default: null
        },
        paymentTermsValue: {
            type: Number,
            default: 0
        },
        reminders: [ReminderSchema],
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
