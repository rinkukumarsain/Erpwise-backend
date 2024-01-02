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
        enquiryItemId: Joi.string().required(),
        supplierId: Joi.string().required(),
        supplierItemId: Joi.string().required(),
        supplierContactId: Joi.string().required(),
        currency: Joi.string().required(),
        quantity: Joi.string().required()
    })
};

exports.sendOrSkipMailForEnquirySupplierSelectedItem = {
    body:Joi.object({
        isMailSent: Joi.boolean().optional(),
        isSkipped: Joi.boolean().optional()
    })
};