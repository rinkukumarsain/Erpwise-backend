const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema definition for user actions.
 *
 * @typedef {object} UserAction
 * @property {string} performedBy - The user ID who performed the action.
 * @property {string} performedByEmail - The email of the user who performed the action.
 * @property {string} actionName - The name or description of the action performed.
 * @property {Date} dateTime - The timestamp when the action was performed. Defaults to the current date and time.
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
 * @typedef {object} FinanceMeta
 * @property {mongoose.Types.ObjectId} paymentTermsId - The ID of the payment terms (referenced from 'PaymentTerms' model).
 * @property {mongoose.Types.ObjectId} vatGroupId - The ID of the VAT group (referenced from 'vat' model).
 * @property {number} vatStatus - The VAT status.
 * @property {number} vatNumber - The VAT number.
 * @property {number} discount - The discount value.
 * @property {string} comment - Additional comments.
 * @property {mongoose.Types.ObjectId} createdBy - The user ID who created the finance meta information (referenced from 'User' model).
 * @property {mongoose.Types.ObjectId} updatedBy - The user ID who last updated the finance meta information (referenced from 'User' model).
 */

/**
 * @typedef {object} Supplier
 * @property {string} companyName - The name of the supplier company.
 * @property {string} Id - The unique identifier for the supplier.
 * @property {string} website - The website URL of the supplier.
 * @property {string} email - The email address of the supplier (required).
 * @property {string} phone - The phone number of the supplier.
 * @property {string} industryType - The industry type of the supplier (required).
 * @property {string} note - Additional notes or comments about the supplier.
 * @property {number} level - The level of the supplier (default: 1).
 * @property {string} billingAddress - The billing address of the supplier (required).
 * @property {string} pipelineStage - The pipeline stage of the supplier.
 * @property {mongoose.Types.ObjectId} salesPerson - The ID of the salesperson (referenced from 'User' model, required).
 * @property {mongoose.Types.ObjectId} organisationId - The ID of the organisation (referenced from 'Organisation' model, required).
 * @property {mongoose.Types.ObjectId} createdBy - The user ID who created the supplier (referenced from 'User' model).
 * @property {mongoose.Types.ObjectId} updatedBy - The user ID who last updated the supplier (referenced from 'User' model, default: null).
 * @property {mongoose.Types.ObjectId} currency - The ID of the currency (referenced from 'Currency' model, required).
 * @property {boolean} isActive - Indicates whether the supplier is active (default: true).
 * @property {Array} documents - An array of documents associated with the supplier.
 * @property {FinanceMeta} financeMeta - Financial metadata for the supplier.
 * @property {Array} Activity - An array of user actions associated with the supplier (referenced from 'userActionSchema').
 */

/**
 * Mongoose schema for suppliers.
 *
 * @type {mongoose.Schema<Supplier>}
 */
const supplierSchema = new Schema(
    {
        companyName: {
            type: String,
            required: true
        },
        Id: {
            type: String,
            required: true
        },
        website: {
            type: String
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        industryType: {
            type: String,
            required: true
        },
        note: {
            type: String
        },
        level: {
            type: Number,
            default: 1
        },
        businessAddress: {
            type: String,
            required: true
        },
        pipelineStage: {
            type: String
        },
        salesPerson: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        salesPersonName: {
            type: String,
            required: true
        },
        organisationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Organisation',
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
            required: true,
            ref: 'Currency'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        isContactAdded: {
            type: Boolean,
            default: false
        },
        isBillingAddressAdded: {
            type: Boolean,
            default: false
        },
        isShippingAddressAdded: {
            type: Boolean,
            default: false
        },
        isItemAdded: {
            type: Boolean,
            default: false
        },
        isFinanceAdded: {
            type: Boolean,
            default: false
        },
        documents: {
            type: Array
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
                    vatStatus: {
                        type: String,
                        required: true
                    },
                    vatNumber: {
                        type: Number
                    },
                    paymentOption: {
                        type: String,
                        required: true
                    },
                    comment: {
                        type: String
                        // required: true,
                    },
                    createdBy: {
                        type: mongoose.Types.ObjectId,
                        ref: 'User'
                    },
                    updatedBy: {
                        type: mongoose.Types.ObjectId,
                        ref: 'User',
                        default: null
                    }

                },
                { _id: false }
            )
        },
        Activity: [userActionSchema]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('Supplier', supplierSchema);