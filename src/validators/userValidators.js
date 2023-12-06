const { Joi } = require('express-validation');

exports.login = {
    body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    })
};

exports.registerUser = {
    body: Joi.object({
        fname: Joi.string().required(),
        lname: Joi.string().required(),
        email: Joi.string().required(),
        employeeId: Joi.string().required(),
        role: Joi.string().required(),
        password: Joi.string().required(),
        createdBy: Joi.string().required(),
        mobile: Joi.string().optional(),
        jobTitle: Joi.string().optional(),
        organisationId: Joi.string().required()
    })
};

exports.getAllUser = {
    query: Joi.object({
        isActive: Joi.string().optional(),
        organisationId: Joi.string().optional(),
        isRole: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional()

    })
};

exports.editUser = {
    body: Joi.object({
        fname: Joi.string().optional(),
        lname: Joi.string().optional(),
        email: Joi.string().optional(),
        mobile: Joi.string().optional(),
        jobTitle: Joi.string().optional()
    })
};

exports.enableOrDisableUser = {
    body: Joi.object({
        userId: Joi.string().required(),
        isActive: Joi.boolean().required()
    })
};

exports.editUser = {
    body: Joi.object({
        fname: Joi.string().optional(),
        lname: Joi.string().optional(),
        email: Joi.string().optional(),
        mobile: Joi.string().optional(),
        jobTitle: Joi.string().optional()
    })
};

exports.enableOrDisableUser = {
    body: Joi.object({
        userId: Joi.string().required(),
        isActive: Joi.boolean().required()
    })
};