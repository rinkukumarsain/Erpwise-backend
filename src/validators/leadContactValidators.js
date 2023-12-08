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

// exports.updateLeadById = {
//     body: Joi.object({
//         companyName: Joi.string().optional(),
//         email: Joi.string().optional(),
//         phone: Joi.string().optional(),
//         address: Joi.string().optional(),
//         website: Joi.string().optional(),
//         note: Joi.string().optional(),
//         dueDate: Joi.string().optional(),
//         isActive: Joi.string().optional()
//     })
// };