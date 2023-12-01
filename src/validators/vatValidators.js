const { Joi } = require('express-validation');

exports.createVat = {
    body: Joi.object({
        name: Joi.string().required(),
        percentage: Joi.number().required()
    })
};

exports.getAllVat = {
    query: Joi.object({
        isActive: Joi.string().enum(['true', 'false']).optional()
    })
};

exports.updatevat = {
    body: Joi.object({
        name: Joi.string().optional(),
        percentage: Joi.number().optional()
    })
};