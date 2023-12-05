const { Joi } = require('express-validation');

exports.createLead = {
    body: Joi.object({
        companyName: Joi.string().required(),
        salesPerson: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
        note: Joi.string().required(),
        currency: Joi.string().required(),
        dueDate: Joi.string().required(),
        isActive: Joi.string().required()
    })
};

exports.getAllLead = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        isQualified: Joi.string().optional(),
        dueDate: Joi.string().optional()
    })
};

exports.updateLeadById = {
    body: Joi.object({
        companyName: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        address: Joi.string().optional(),
        note: Joi.string().optional(),
        dueDate: Joi.string().optional(),
        isActive: Joi.string().optional()
    })
};