const { Joi } = require('express-validation');

exports.createLeadContact = {
    body: Joi.object({
        name: Joi.string().required(),
        leadId: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        country: Joi.string().required(),
        designation: Joi.string().required(),
        location: Joi.string().required()
    })
};

// exports.getAllLead = {
//     query: Joi.object({
//         isActive: Joi.string().optional(),
//         isQualified: Joi.string().optional(),
//         dueDate: Joi.string().optional(),
//         organisationId: Joi.string().optional(),
//         isRole: Joi.string().optional(),
//         page: Joi.string().optional(),
//         perPage: Joi.string().optional(),
//         sortBy: Joi.string().optional(),
//         sortOrder: Joi.string().optional()
//     })
// };

exports.updateLeadContactById = {
    body: Joi.object({
        name: Joi.string().optional(),
        leadId: Joi.string().required(),
        email: Joi.string().optional(),
        location: Joi.string().optional(),
        designation: Joi.string().optional(),
        phone: Joi.string().optional(),
        country: Joi.string().optional()
    })
};