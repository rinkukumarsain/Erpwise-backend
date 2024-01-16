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
        vatGroupId: Joi.string().required(),
        vatGroup: Joi.number().required(),
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
        agentTotalCommissionValue: Joi.number().required(),
        subTotal: Joi.number().required(),
        currencyExchangeRate: Joi.number().allow(null)
    })
};