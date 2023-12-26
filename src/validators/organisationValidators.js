const { Joi } = require('express-validation');

exports.createOrganisation = {
    body: Joi.object({
        companyName: Joi.string().required(),
        website: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        industryType: Joi.string().required(),
        currency: Joi.string().required(),
        documents: Joi.array().optional()
    })
};

exports.getAllOrganisation = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional()
    })
};

exports.updateOrganisation = {
    body: Joi.object({
        companyName: Joi.string().optional(),
        website: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        industryType: Joi.string().optional(),
        documents: Joi.array().optional()
    })
};