const { Joi } = require('express-validation');

exports.create = {
    body: Joi.object({
        orgCurrency: Joi.string().required(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required(),
        currencyRate: Joi.array().items(
            Joi.object({
                currencyRate: Joi.number().required(),
                currencyId: Joi.string().required()
            })
        ).unique((a, b) => a.currencyId === b.currencyId).required()
    })
};
exports.updated = {
    body: Joi.object({
        orgCurrency: Joi.string().optional(),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().optional(),
        isActive: Joi.boolean().optional(),
        currencyRate: Joi.array().items(
            Joi.object({
                currencyRate: Joi.number().optional(),
                currencyId: Joi.string().optional()
            })
        ).unique((a, b) => a.currencyId === b.currencyId).optional()
    })
};
