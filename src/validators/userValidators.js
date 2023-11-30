const { Joi } = require('express-validation');

exports.login = {
    body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    })
};

exports.registerUser = {
    body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        role: Joi.string().required(),
        password: Joi.string().required(),
        createdBy: Joi.string().required(),
        mobile: Joi.string().optional(),
        isActive: Joi.boolean().required(),
        jobTitle: Joi.string().optional(),
        baseCurrency: Joi.string().required()
    })
};