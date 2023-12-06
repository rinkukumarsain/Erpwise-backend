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
