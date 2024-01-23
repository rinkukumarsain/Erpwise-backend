const { Joi } = require('express-validation');

exports.createEnquiry = {
    body: Joi.object({
        companyName: Joi.string().required(),
        contactPerson: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        salesPerson: Joi.string().required(),
        dueDate: Joi.string().required(),
        isActive: Joi.boolean().optional(),
        currency: Joi.string().required(),
        totalOrderValue: Joi.string().required(),
        note: Joi.string().allow(null),
        leadId: Joi.string().required(),
        leadContactId: Joi.string().required()
    })
};

exports.updateEnquiryById = {
    body: Joi.object({
        // companyName: Joi.string().optional(),
        contactPerson: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        salesPerson: Joi.string().optional(),
        dueDate: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
        currency: Joi.string().optional(),
        totalOrderValue: Joi.string().optional(),
        note: Joi.string().optional(),
        // leadId: Joi.string().optional(),
        leadContactId: Joi.string().optional()
    })
};

exports.getAllEnquiry = {
    query: Joi.object({
        id: Joi.string().optional(),
        leadId: Joi.string().optional(),
        isActive: Joi.string().optional(),
        salesPerson: Joi.string().optional(),
        isQualified: Joi.string().optional(),
        dueDate: Joi.string().optional(),
        organisationId: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional(),
        search: Joi.string().optional(),
        level: Joi.string().optional()
    })
};

exports.deleteEnquiryDocument = {
    body: Joi.object({
        imageUrl: Joi.string().required()
    })
};

exports.createQuote = {
    body: Joi.object({
        html: Joi.string().allow(null),
        note: Joi.string().allow(null),
        enquiryId: Joi.string().required(),
        vatGroupId: Joi.string().allow(null),
        vatGroup: Joi.number().optional(),
        margin: Joi.number().required(),
        freightCharges: Joi.number().required(),
        packingCharges: Joi.number().required(),
        miscCharges: Joi.number().required(),
        discount: Joi.number().required(),
        agentTotalCommission: Joi.number().required(),
        duedate: Joi.string().required(),
        currency: Joi.string().allow(null),
        addedFreightCharges: Joi.number().required(),
        addedSupplierTotal: Joi.number().required(),
        addedPackingCharges: Joi.number().required(),
        addedSupplierFinalTotal: Joi.number().required(),
        addedVatGroupValue: Joi.number().required(),
        vatGroupValue: Joi.number().required(),
        discountValue: Joi.number().required(),
        marginValue: Joi.number().required(),
        totalQuote: Joi.number().required(),
        finalQuote: Joi.number().required(),
        agentTotalCommissionValue: Joi.number().required(),
        subTotal: Joi.number().required(),
        currencyExchangeRate: Joi.number().allow(null)
    })
};

exports.createPI = {
    body: Joi.object({
        // Id: Joi.string().required(),
        quoteId: Joi.string().required(),
        customerRefNo: Joi.string().required(),
        invoiceDate: Joi.string().required(),
        invoiceDueDate: Joi.string().required(),
        buyerBillingAddressId: Joi.string().required(),
        buyerBillingAddress: Joi.string().required(),
        buyerShippingAddressId: Joi.string().required(),
        buyerShippingAddress: Joi.string().required(),
        partialDelivery: Joi.boolean().required(),
        countryOrigin: Joi.string().required(),
        countryDestination: Joi.string().required(),
        transactionCurrency: Joi.string().allow(null),
        paymentOption: Joi.string().allow(null),
        deliveryTerm: Joi.string().allow(null),
        vatGroupId: Joi.string().required(),
        vatGroup: Joi.number().required(),
        shippingDesciption: Joi.string().required(),
        totalItems: Joi.number().required(),
        totalQuantity: Joi.number().required(),
        totalNetWt: Joi.number().allow(null),
        addedSupplierTotal: Joi.number().required(),
        discount: Joi.number().required(),
        discountValue: Joi.number().required(),
        freightCharges: Joi.number().required(),
        packingCharges: Joi.number().required(),
        vatGroupValue: Joi.number().required(),
        addedSupplierFinalTotal: Joi.number().required(),
        notes: Joi.string().allow(null),
        additionalNotes: Joi.string().allow(null),
        signatoryName: Joi.string().required(),
        place: Joi.string().required(),
        issueDate: Joi.string().required(),
        signature: Joi.string().required(),
        role: Joi.string().required(),
        currencyExchangeRate: Joi.number().allow(null)
    })
};

exports.createSO = {
    body: Joi.object({
        // Id: Joi.string().required(),
        proformaInvoiceId: Joi.string().required(),
        commodity: Joi.string().allow(null),
        customerPORefNo: Joi.string().required(),
        packing: Joi.string().allow(null),
        paymentTermsId: Joi.string().allow(null),
        paymentTerms: Joi.number().allow(null),
        deliveryPoint: Joi.number().allow(null),
        notes: Joi.string().allow(null),
        additionalNotes: Joi.string().allow(null),
        documents: Joi.array().items(Joi.string().required()).allow(null),
        customerPO: Joi.string().allow(null)
    })
};

exports.createSupplierPO = {
    body: Joi.object({
        // Id: Joi.string().required(),
        // enquiryId: Joi.string().required(),
        supplierId: Joi.string().required(),
        supplierAddressId: Joi.string().required(),
        supplierAddress: Joi.string().required(),
        shipTo: Joi.string().required(),
        shipToCustomer: Joi.string().allow(null),
        leadAddressId: Joi.string().allow(null),
        shipToWarehouseId: Joi.string().allow(null),
        warehouseId: Joi.string().allow(null),
        deliveryPoint: Joi.number().required(),
        supplierPODate: Joi.string().required(),
        validTillDate: Joi.string().required(),
        packing: Joi.string().required(),
        commodity: Joi.string().required(),
        paymentTermsId: Joi.string().required(),
        paymentTerms: Joi.number().required(),
        documents: Joi.array().items(Joi.string().required()).allow(null),
        supplierOrderConfirmation: Joi.string().required(null),
        notes: Joi.string().allow(null),
        additionalNotes: Joi.string().allow(null),
        financeMeta: Joi.object({
            paymentTermsId: Joi.string().allow(null),
            paymentTerms:Joi.number().allow(null),
            deliveryTerm: Joi.optional().required(),
            vatGroupId: Joi.string().allow(null),
            paymentOption: Joi.string().required(),
            supplierTotal: Joi.number().required(),
            freightCharges: Joi.number().required(),
            packingCharges: Joi.number().required(),
            currency: Joi.string().required(),
            vatGroupValue: Joi.number().allow(null),
            vatGroupValueConverted: Joi.number().allow(null),
            supplierTotalConverted: Joi.number().required(),
            freightChargesConverted: Joi.number().required(),
            packingChargesConverted: Joi.number().required(),
            convertedToCurrency: Joi.string().required(),
            currencyExchangeRate: Joi.number().required()
        }).required()
    })
};