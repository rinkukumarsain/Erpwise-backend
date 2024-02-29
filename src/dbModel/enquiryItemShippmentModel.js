const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {object} ShipmentStage
 * @property {Date} date - Date of the stage
 * @property {string} [notes] - Optional note for the stage
 * @property {string} [document] - Document associated with the stage
 * @property {mongoose.Types.ObjectId} createdBy - ID of the user who created the stage
 * @property {mongoose.Types.ObjectId} [updatedBy] - ID of the user who updated the stage
 * @property {string} [createdByName] - Name of the user who created the stage
 * @property {string} [createdByRole] - Role of the user who created the stage
 */

/**
 * @typedef {object} EnquiryItemShipment
 * @property {string} Id - Unique identifier for the shipment
 * @property {mongoose.Types.ObjectId} enquiryId - ID of the associated enquiry
 * @property {mongoose.Types.ObjectId} supplierPoId - ID of the associated supplier purchase order
 * @property {mongoose.Types.ObjectId} supplierId - ID of the supplier
 * @property {mongoose.Types.ObjectId} enquiryFinalItemId - ID of the associated final item in the enquiry
 * @property {'customer' | 'warehouse' | 'fob/exw'} shipTo - Shipment destination
 * @property {string} partNumber - Part number
 * @property {string} partNumberCode - Part number code
 * @property {string} partDesc - Part description
 * @property {number} unitPrice - Unit price
 * @property {number} quantity - Quantity to be shipped
 * @property {number} shipQuantity - Shipped quantity
 * @property {number} totalPrice - Total price
 * @property {mongoose.Types.ObjectId} supplierAddressId - ID of the supplier's address
 * @property {string} supplierAddress - Supplier's address
 * @property {string} [shipToCustomer] - Address for customer shipment
 * @property {mongoose.Types.ObjectId} [leadAddressId] - ID of the lead's address
 * @property {string} [shipToWarehouse] - Address for warehouse shipment
 * @property {mongoose.Types.ObjectId} [warehouseId] - ID of the associated warehouse
 * @property {Date} deliveryDate - Expected delivery date
 * @property {string} [notes] - Optional note for the shipment
 * @property {number} level - Shipment level
 * @property {string} stageName - Current stage of the shipment
 * @property {ShipmentStage | null} readyForDispatch - Details of the ready for dispatch stage
 * @property {ShipmentStage | null} shipmentDispatched - Details of the shipment dispatched stage
 * @property {ShipmentStage | null} warehouseGoodsOut - Details of the warehouse goods out stage
 * @property {ShipmentStage | null} shipmentDelivered - Details of the shipment delivered stage
 * @property {boolean} isActive - Indicates if the shipment is active
 * @property {boolean} isDeleted - Indicates if the shipment is deleted
 */

/**
 * Mongoose schema for Enquiry Item Shipment
 * 
 * @type {mongoose.Schema<EnquiryItemShipment>}
 */
const enquiryitemshippmentSchema = new Schema(
    {
        Id: {
            type: String,
            required: true,
            unique: true
        },
        enquiryId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquiry',
            required: true
        },
        supplierPoId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquirySupplierPO',
            required: true
        },
        supplierId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Supplier'
        },
        organisationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Organisation',
            required: true
        },
        enquiryFinalItemId: {
            type: Schema.Types.ObjectId,
            ref: 'EnquirySupplierSelectedItem',
            required: true
        },
        shipTo: {
            type: String,
            required: true,
            enum: ['customer', 'warehouse', 'fob/exw']
        },
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
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        shipQuantity: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        supplierAddressId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'SupplierAddress'
        },
        supplierAddress: {
            type: String,
            required: true
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
        deliveryDate: {
            type: Date,
            required: true
        },
        notes: {
            type: String,
            default: null
        },
        level: {
            type: Number,
            default: 0
        },
        stageName: {
            type: String,
            default: 'Ready_For_Dispatch'
        },
        readyForDispatch: {
            type: new Schema(
                {
                    date: {
                        type: Date,
                        required: true
                    },
                    notes: {
                        type: String,
                        default: null
                    },
                    document: {
                        type: String,
                        default: null
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
                    createdByName: {
                        type: String,
                        default: null
                    },
                    createdByRole: {
                        type: String,
                        default: null
                    }
                },
                {
                    timestamps: true,
                    versionKey: false
                }
            ),
            default: null
        },
        shipmentDispatched: {
            type: new Schema(
                {
                    carrier: {
                        type: String,
                        default: null
                    },
                    trackingNumber: {
                        type: String,
                        default: null
                    },
                    numOfBoxes: {
                        type: Number,
                        default: null
                    },
                    dispatchDate: {
                        type: Date,
                        required: true
                    },
                    expectedGoodsInDate: {
                        type: Date,
                        required: true
                    },
                    notes: {
                        type: String,
                        default: null
                    },
                    document: {
                        type: String,
                        default: null
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
                    createdByName: {
                        type: String,
                        default: null
                    },
                    createdByRole: {
                        type: String,
                        default: null
                    },
                    warehouseComment: {
                        type: String,
                        default: null
                    },
                    warehouseDocument: {
                        type: String,
                        default: null
                    },
                    warehouseRecievedDate: {
                        type: Date,
                        default: null
                    },
                    warehouseQtyRecieved: {
                        type: Number,
                        default: null
                    },
                    warehouseQtyDamagedReturn: {
                        type: Number,
                        default: null
                    },
                    isGoodsAccepted: {
                        type: Boolean,
                        default: false
                    },
                    goodsAcceptedBy: {
                        type: mongoose.Types.ObjectId,
                        ref: 'User',
                        default: null
                    }

                },
                {
                    timestamps: true,
                    versionKey: false
                }
            ),
            default: null
        },
        warehouseGoodsOut: {
            type: new Schema(
                {
                    carrier: {
                        type: String,
                        required: true
                    },
                    trackingNumber: {
                        type: String,
                        required: true
                    },
                    numOfBoxes: {
                        type: Number,
                        default: null
                    },
                    goodsOutDate: {
                        type: Date,
                        required: true
                    },
                    packingCharges: {
                        type: Number,
                        default: null
                    },
                    freightCharges: {
                        type: Number,
                        default: null
                    },
                    notes: {
                        type: String,
                        default: null
                    },
                    document: {
                        type: String,
                        default: null
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
                    createdByName: {
                        type: String,
                        default: null
                    },
                    createdByRole: {
                        type: String,
                        default: null
                    }
                },
                {
                    timestamps: true,
                    versionKey: false
                }
            ),
            default: null
        },
        shipmentDelivered: {
            type: new Schema(
                {
                    deliveryDate: {
                        type: Date,
                        required: true
                    },
                    notes: {
                        type: String,
                        default: null
                    },
                    document: {
                        type: String,
                        default: null
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
                    createdByName: {
                        type: String,
                        default: null
                    },
                    createdByRole: {
                        type: String,
                        default: null
                    }
                },
                {
                    timestamps: true,
                    versionKey: false
                }
            ),
            default: null
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
        supplierBillId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquirySupplierBill',
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isSupplierBillCreated: {
            type: Boolean,
            default: false
        },
        supplierBillTotalNetWt: {
            type: Number,
            default: 0
        },
        invoiceBillId: {
            type: mongoose.Types.ObjectId,
            ref: 'enquiryInvoiceBill',
            default: null
        },
        isInvoiceBillCreated: {
            type: Boolean,
            default: false
        },
        invoiceBillTotalNetWt: {
            type: Number,
            default: 0
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

module.exports = mongoose.model('enquiryitemshippment', enquiryitemshippmentSchema);