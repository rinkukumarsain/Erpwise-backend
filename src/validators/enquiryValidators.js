const { Joi } = require('express-validation');

exports.createEnquiry = {
    body: Joi.object({
        companyName: Joi.string().required(),
        contactPerson: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        salesPerson: Joi.string().required(),
        dueDate: Joi.string().required(),
        isActive: Joi.string().optional(),
        currency: Joi.string().required(),
        totalOrderValue: Joi.string().required(),
        note: Joi.string().optional(),
        leadId: Joi.string().required(),
        leadContactId: Joi.string().required()
    })
};