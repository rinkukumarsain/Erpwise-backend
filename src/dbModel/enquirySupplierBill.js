const mongoose = require('mongoose');
const { Schema } = mongoose;

// /**
//  * Mongoose schema for user actions.
//  *
//  */
// const ReminderSchema = new Schema(
//     {
//         subject: {
//             type: String,
//             required: true
//         },
//         date: {
//             type: Date,
//             required: true
//         },
//         comment: {
//             type: String,
//             required: true
//         },
//         createdBy: {
//             type: mongoose.Types.ObjectId,
//             ref: 'User'
//         },
//         createdByName: {
//             type: String,
//             required: true
//         }
//     },
//     {
//         timestamps: true,
//         versionKey: false
//     }
// );

const enquirySupplierBillSchema = new Schema(
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
        organisationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Organisation',
            required: true
        },
        supplierPoId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquirySupplierPO',
            required: true
        },
        supplierRefNo: {
            type: String,
            required: true
        },
        billDate: {
            type: Date,
            required: true
        },
        billDueDate: {
            type: Date,
            required: true
        },
        billingAddressId: {
            type: mongoose.Types.ObjectId,
            ref: 'SupplierAddress',
            required: true
        },
        billingAddress: {
            type: String,
            required: true
        },
        shippingAddressId: {
            type: mongoose.Types.ObjectId,
            ref: 'SupplierAddress',
            required: true
        },
        shippingAddress: {
            type: String,
            required: true
        },
        partialDelivery: {
            type: Boolean,
            default: false
        },
        countryOrigin: {
            type: String,
            required: true
        },
        countryDestination: {
            type: String,
            required: true
        },
        transactionCurrency: {
            type: mongoose.Types.ObjectId,
            // required: true,
            ref: 'Currency'
        },
        paymentOption: {
            type: String,
            required: true
        },
        deliveryTerm: {
            type: String,
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
        vatGroupId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'vat'
        },
        vatGroup: {
            type: Number,
            required: true
        },
        shipmentTrackingID: {
            type: String,
            required: true
        },
        shippingDesciption: {
            type: String,
            required: true
        },
        shipmentIds: {
            type: Array,
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
        totalAmountBeforeVat: {
            type: Number,
            default: 0
        },
        totalAmountAfterVat: {
            type: Number,
            default: 0
        },
        notes: {
            type: String,
            default: null
        },
        additionalNotes: {
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
        currencyExchangeRate: {
            type: Number,
            // required: true,s
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
        isActive: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
        // reminders: [ReminderSchema]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('enquirySupplierBill', enquirySupplierBillSchema);
