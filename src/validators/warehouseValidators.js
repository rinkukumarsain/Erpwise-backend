const { Joi } = require('express-validation');

exports.create = {
    body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        mobile: Joi.string().optional(),
        mobileCode: Joi.string().optional(),
        managers: Joi.array().items(Joi.string().required()).required(),
        buildingNo: Joi.string().optional(),
        area: Joi.string().required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        pincode: Joi.string().optional(),
        note: Joi.string().optional(),
        isActive: Joi.boolean().allow('')
    })
};

exports.edit = {
    body: Joi.object({
        name: Joi.string().optional(),
        email: Joi.string().optional(),
        mobile: Joi.string().optional(),
        mobileCode: Joi.string().optional(),
        managers: Joi.array().items(Joi.string().required()).optional(),
        buildingNo: Joi.string().optional(),
        area: Joi.string().optional(),
        country: Joi.string().optional(),
        state: Joi.string().optional(),
        city: Joi.string().optional(),
        pincode: Joi.string().optional(),
        note: Joi.string().optional(),
        isActive: Joi.boolean().optional()
    })
};