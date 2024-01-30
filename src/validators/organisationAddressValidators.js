const { Joi } = require('express-validation');

exports.createOrganisationAddress = {
    body: Joi.object({
        // organisationId: Joi.string().required(),
        addresstype: Joi.string().required(),
        address: Joi.string().required(),
        street: Joi.string().required(),
        area: Joi.string().required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        pincode: Joi.string().required(),
        isDefault: Joi.boolean().required()
    })
};

exports.getAllOrganisationAddresses = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        isDefault: Joi.string().optional(),
        addresstype: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional()
    })
};

exports.updateOrganisationAddress = {
    body: Joi.object({
        // organisationId: Joi.string().required(),
        addresstype: Joi.string().required(),
        address: Joi.string().required(),
        street: Joi.string().required(),
        area: Joi.string().required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        pincode: Joi.string().required(),
        isDefault: Joi.boolean().required()
    })
};