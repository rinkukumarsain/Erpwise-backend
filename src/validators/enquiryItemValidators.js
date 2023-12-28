const { Joi } = require('express-validation');

exports.createEnquiryItem = {
    body: Joi.object({
        enquiryId: Joi.string().required(),
        partNumber: Joi.string().required(),
        partDesc: Joi.string().required(),
        unitPrice: Joi.string().required(),
        delivery: Joi.string().required(),
        notes: Joi.string().optional(),
        hscode: Joi.string().required(),
        supplierId: Joi.string().optional(),
        supplierItemId: Joi.string().optional()
    })
};

exports.updateEnquiryItemById = {
    body: Joi.object({
        partNumber: Joi.string().optional(),
        partDesc: Joi.string().optional(),
        unitPrice: Joi.string().optional(),
        delivery: Joi.string().optional(),
        notes: Joi.string().optional(),
        hscode: Joi.string().optional(),
        supplierId: Joi.string().optional(),
        supplierItemId: Joi.string().optional()
    })
};