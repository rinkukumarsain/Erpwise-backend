const { Joi } = require('express-validation');

exports.create = {
    body: Joi.object({
        leadId: Joi.string().required(),
        addresstype: Joi.string().required(),
        address: Joi.string().required(),
        street: Joi.string().required(),
        area: Joi.string().required(),
        country: Joi.string().required(),
        state: Joi.string().allow(''),
        city: Joi.string().required(),
        pincode: Joi.string().required()
    })
};

exports.update = {
    body: Joi.object({
        addresstype: Joi.string().optional(),
        address: Joi.string().optional(),
        street: Joi.string().optional(),
        area: Joi.string().optional(),
        country: Joi.string().optional(),
        state: Joi.string().optional(),
        city: Joi.string().optional(),
        pincode: Joi.string().optional()
    })
};