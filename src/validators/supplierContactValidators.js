const { Joi } = require('express-validation');

exports.createSupplierContact = {
    body: Joi.object({
        name: Joi.string().required(),
        designation: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        address1: Joi.string().required(),
        address2: Joi.string().required(),
        supplierId: Joi.string().required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        pinCode: Joi.string().required()
    })
};

exports.updateSupplierContactById = {
    body: Joi.object({
        name: Joi.string().optional(),
        designation: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        address1: Joi.string().optional(),
        address2: Joi.string().optional(),
        supplierId: Joi.string().optional(),
        country: Joi.string().optional(),
        state: Joi.string().optional(),
        city: Joi.string().optional(),
        pinCode: Joi.string().optional()
    })
};