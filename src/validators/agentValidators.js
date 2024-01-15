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