const { Joi } = require('express-validation');

exports.createVat = {
    body: Joi.object({
        name: Joi.string().required(),
        percentage: Joi.number().required()
    })
};

exports.getAllVat = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional()
    })
};

exports.updatevat = {
    body: Joi.object({
        name: Joi.string().optional(),
        percentage: Joi.number().optional()
    })
};

exports.enableOrDisableVat = {
    body: Joi.object({
        vatId: Joi.string().required(),
        isActive: Joi.boolean().required()
    })
};