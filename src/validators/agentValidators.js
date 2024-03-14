const { Joi } = require('express-validation');

exports.createAgent = {
    body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        mobile: Joi.string().optional(),
        mobileCode: Joi.string().optional(),
        paymentTermsId: Joi.string().required(),
        vatGroupId: Joi.string().required(),
        note: Joi.string().optional(),
        billingAdd1: Joi.string().required(),
        billingAdd2: Joi.string().optional(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        pincode: Joi.string().required()
    })
};

exports.editAgent = {
    body: Joi.object({
        name: Joi.string().optional(),
        email: Joi.string().optional(),
        mobile: Joi.string().optional(),
        mobileCode: Joi.string().optional(),
        paymentTermsId: Joi.string().optional(),
        vatGroupId: Joi.string().optional(),
        note: Joi.string().optional(),
        billingAdd1: Joi.string().optional(),
        billingAdd2: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
        pincode: Joi.string().optional(),
        isActive: Joi.boolean().optional()
    })
};

exports.getAllAgent = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional(),
        search: Joi.string().optional()
    })
};