const { Joi } = require('express-validation');

exports.createSupplierItem = {
    body: Joi.object({
        supplierId: Joi.string().required(),
        partNumber: Joi.string().required(),
        partDesc: Joi.string().required(),
        unitPrice: Joi.string().required(),
        delivery: Joi.string().required(),
        notes: Joi.string().optional(),
        hscode: Joi.string().required()
    })
};

exports.updateSupplierItemById = {
    body: Joi.object({
        partNumber: Joi.string().optional(),
        partDesc: Joi.string().optional(),
        unitPrice: Joi.string().optional(),
        delivery: Joi.string().optional(),
        notes: Joi.string().optional(),
        hscode: Joi.string().optional()
    })
};