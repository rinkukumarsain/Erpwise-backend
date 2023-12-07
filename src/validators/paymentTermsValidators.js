const { Joi } = require('express-validation');

exports.createPaymentTerms = {
    body: Joi.object({
        name: Joi.string().required(),
        noOfDays: Joi.number().required()
    })
};

exports.getAllPaymentTerms = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional()
    })
};

exports.updatePaymentTerms = {
    body: Joi.object({
        name: Joi.string().optional(),
        noOfDays: Joi.number().optional()
    })
};