const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {object} UserAction
 * @property {mongoose.Types.ObjectId} performedBy - The user ID who performed the action.
 * @property {string} performedByEmail - The email of the user who performed the action.
 * @property {string} actionName - The name or description of the action performed.
 * @property {Date} createdAt - The timestamp when the document was created.
 * @property {Date} updatedAt - The timestamp when the document was last updated.
 */

/**
 * Mongoose schema for user actions.
 *
 * @type {mongoose.Schema<UserAction>}
 */
const userActionSchema = new Schema(
    {
        performedBy: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        performedByEmail: {
            type: String,
            required: true
        },
        actionName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/**
 * @typedef {object} Enquiry
 * @property {string} companyName - The name of the company associated with the enquiry.
 * @property {string} Id - The unique identifier for the enquiry.
 * @property {string} contactPerson - The name of the contact person associated with the enquiry.
 * @property {string} email - The email address associated with the enquiry.
 * @property {string} phone - The phone number associated with the enquiry.
 * @property {mongoose.Types.ObjectId} salesPerson - The ID of the salesperson (referenced from 'User' model).
 * @property {Date} dueDate - The due date associated with the enquiry.
 * @property {number} totalOrderValue - The total order value associated with the enquiry.
 * @property {string} note - Additional notes or comments about the enquiry.
 * @property {mongoose.Types.ObjectId} organisationId - The ID of the organisation (referenced from 'Organisation' model).
 * @property {mongoose.Types.ObjectId} leadId - The ID of the lead (referenced from 'Lead' model).
 * @property {mongoose.Types.ObjectId} leadContactId - The ID of the lead contact (referenced from 'LeadContact' model).
 * @property {mongoose.Types.ObjectId} currency - The ID of the currency (referenced from 'Currency' model).
 * @property {mongoose.Types.ObjectId} createdBy - The ID of the user who created the enquiry (referenced from 'User' model).
 * @property {mongoose.Types.ObjectId} updatedBy - The ID of the user who last updated the enquiry (referenced from 'User' model).
 * @property {Array<UserAction>} Activity - An array of user actions associated with the enquiry.
 * @property {boolean} isActive - Indicates whether the enquiry is active.
 * @property {boolean} isDeleted - Indicates whether the enquiry is deleted.
 * @property {Date} createdAt - The timestamp when the enquiry was created.
 * @property {Date} updatedAt - The timestamp when the enquiry was last updated.
 */

/**
 * Mongoose schema for enquiry.
 *
 * @type {mongoose.Schema<Enquiry>}
 */
const enquirySchema = new Schema(
    {
        companyName: {
            type: String,
            required: true
        },
        Id: {
            type: String,
            required: true
        },
        contactPerson: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        salesPerson: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        dueDate: {
            type: Date,
            default: ''
        },
        totalOrderValue: {
            type: Number,
            required: true
        },
        note: {
            type: String,
            default: ''
        },
        organisationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Organisation',
            required: true
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
        currency: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Currency'
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        stageName: {
            type: String,
            default: 'Add_Item'
        },
        updatedBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        quoteId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquiryQuote',
            default: null
        },
        Activity: [userActionSchema],
        documents: {
            type: Array
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        level: {
            type: Number,
            default: 1
        },
        proformaInvoices: {
            type: new Schema(
                {
                    quoteId: {
                        type: mongoose.Types.ObjectId,
                        ref: 'enquiryQuote',
                        default: null
                    },
                    customerRefNo: {
                        type: String,
                        required: true
                    },
                    invoiceDate: {
                        type: Date,
                        required: true
                    },
                    invoiceDueDate: {
                        type: Date,
                        required: true
                    },
                    buyerBillingAddress: {
                        type: mongoose.Types.ObjectId,
                        ref: '',
                        required: true
                    },
                    buyerShippingAddress: {
                        type: mongoose.Types.ObjectId,
                        ref: '',
                        required: true
                    },
                    countryOrigin: {
                        type: String,
                        required: true
                    },
                    countryDestination: {
                        type: String,
                        required: true
                    },
                    shippingDesciption: {
                        type: String,
                        required: true
                    },
                    shippingTrackingId: {
                        type: String,
                        required: true
                    },
                    totalNetWt: {
                        type: String,
                        required: true
                    },
                    expenditures: {
                        type: String,
                        required: true
                    },
                    notes: {
                        type: String,
                        default: null
                    },
                    signatoryName: {
                        type: String,
                        required: true
                    },
                    place: {
                        type: String,
                        required: true
                    },
                    issueDate: {
                        type: Date,
                        required: true
                    },
                    signature: {
                        type: String,
                        required: true
                    },
                    role: {
                        type: String,
                        required: true
                    },
                    createXero: {
                        type: Boolean,
                        default: false
                    },
                    piNo: {
                        type: String,
                        required: true
                    },
                    additional: {
                        type: String,
                        required: true
                    },
                    xeroInvoice: {
                        type: String,
                        default: null
                    },
                    xeroInvNumber: {
                        type: String,
                        default: null
                    },
                    paymentStatus: {
                        type: String, 
                        default: 'pending'
                    },
                    outstanding: {
                        type: Number,
                        default: 0
                    },
                    partialDelivery: {
                        type: Boolean,
                        default: false
                    },
                    totalAmount: {
                        type: Number,
                        default: 0
                    },
                    totalVatPi: {
                        type: Number,
                        required: true,
                        default: 0
                    },
                    xeroPayment: [{ type: Object }],
                    currencyExchangeRate: {
                        type: Number,
                        required: true,
                        default: 0
                    },
                    totalConvertedAmount: {
                        type: Number,
                        required: true,
                        default: 0
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

                }
            ),
            default: null
        },
        isItemAdded: {
            type: Boolean,
            default: false
        },
        isItemShortListed: {
            type: Boolean,
            default: false
        },
        isQuoteCreated: {
            type: Boolean,
            default: false
        },
        isPiCreated: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('Enquiry', enquirySchema);