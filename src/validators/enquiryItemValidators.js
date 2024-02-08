const { Joi } = require('express-validation');

exports.createEnquiryItem = {
    body: Joi.object({
        enquiryId: Joi.string().required(),
        partNumber: Joi.string().required(),
        partDesc: Joi.string().required(),
        unitPrice: Joi.string().required(),
        quantity: Joi.string().required(),
        delivery: Joi.string().required(),
        notes: Joi.string().optional(),
        hscode: Joi.string().required()
    })
};

exports.updateEnquiryItemById = {
    body: Joi.object({
        partNumber: Joi.string().optional(),
        partDesc: Joi.string().optional(),
        unitPrice: Joi.string().optional(),
        quantity: Joi.string().optional(),
        delivery: Joi.string().optional(),
        notes: Joi.string().optional(),
        hscode: Joi.string().optional()
    })
};

exports.addEnquirySupplierSelectedItem = {
    body: Joi.object({
        enquiryId: Joi.string().required(),
        supplierId: Joi.string().required(),
        data: Joi.array().items(
            Joi.object({
                enquiryItemId: Joi.string().required(),
                supplierItemId: Joi.string().required(),
                quantity: Joi.string().required()
            }).required()
        ).required()
    })
};

exports.addFinanceDetailsSuppler = {
    body: Joi.object({
        paymentTermsId: Joi.string().allow(null),
        deliveryTerm: Joi.optional().required(),
        vatGroupId: Joi.string().allow(null),
        paymentOption: Joi.string().required(),
        supplierTotal: Joi.string().required(),
        freightCharges: Joi.string().required(),
        packingCharges: Joi.string().required(),
        currency: Joi.string().allow(null),
        vatGroupValue: Joi.number().allow(null),
        vatGroupValueConverted: Joi.number().allow(null),
        supplierTotalConverted: Joi.number().required(),
        freightChargesConverted: Joi.number().required(),
        packingChargesConverted: Joi.number().required(),
        convertedToCurrency: Joi.string().required(),
        currencyExchangeRate: Joi.number().required()
    })
};