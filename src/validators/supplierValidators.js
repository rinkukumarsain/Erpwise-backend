const { Joi } = require('express-validation');

exports.createSupplier = {
    body: Joi.object({
        companyName: Joi.string().required(),
        website: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        industryType: Joi.string().required(),
        note: Joi.string().required(),
        businessAddress: Joi.string().required(),
        salesPerson: Joi.string().required(),
        currency: Joi.string().required(),
        isActive: Joi.boolean().required()
    })
};

exports.updateSupplierById = {
    body: Joi.object({
        companyName: Joi.string().optional(),
        website: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        industryType: Joi.string().optional(),
        note: Joi.string().optional(),
        businessAddress: Joi.string().optional(),
        salesPerson: Joi.string().optional(),
        // currency: Joi.string().optional(),
        isActive: Joi.boolean().optional()
    })
};

exports.createApprovedSupplier = {
    body: Joi.object({
        companyName: Joi.string().required(),
        website: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        industryType: Joi.string().required(),
        note: Joi.string().required(),
        businessAddress: Joi.string().required(),
        salesPerson: Joi.string().required(),
        currency: Joi.string().required(),
        isActive: Joi.boolean().required()
    })
};

exports.getAllSupplier = {
    query: Joi.object({
        id: Joi.string().optional(),
        isActive: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional(),
        level: Joi.string().optional()
    })
};

exports.addSupplierFinance = {
    body: Joi.object({
        paymentTermsId: Joi.string().optional(),
        vatGroupId: Joi.string().optional(),
        vatStatus: Joi.string().required(),
        vatNumber: Joi.number().optional(),
        paymentOption: Joi.string().required(),
        comment: Joi.string().allow(null)
    })
};

exports.deleteSupplierDocument = {
    body: Joi.object({
        imageUrl: Joi.string().required()
    })
};

exports.moveToPipeLine = {
    body: Joi.object({
        pipelineStage: Joi.string().required()
    })
};

exports.activateDeactivateSupplier = {
    body: Joi.object({
        isApproved: Joi.boolean().required()
    })
};