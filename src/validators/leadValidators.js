const { Joi } = require('express-validation');

exports.createLead = {
    body: Joi.object({
        companyName: Joi.string().required(),
        salesPerson: Joi.string().required(),
        website: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
        note: Joi.string().allow(''),
        currency: Joi.string().required(),
        dueDate: Joi.string().required(),
        isActive: Joi.boolean().required()
    })
};

exports.getAllLead = {
    query: Joi.object({
        id: Joi.string().optional(),
        isActive: Joi.string().optional(),
        salesPerson: Joi.string().optional(),
        isQualified: Joi.string().optional(),
        dueDate: Joi.string().optional(),
        organisationId: Joi.string().optional(),
        page: Joi.string().optional(),
        perPage: Joi.string().optional(),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().optional(),
        search: Joi.string().optional(),
        level: Joi.string().optional()
    })
};

exports.updateLeadById = {
    body: Joi.object({
        companyName: Joi.string().optional(),
        salesPerson: Joi.string().optional(),
        website: Joi.string().optional(),
        email: Joi.string().optional(),
        phone: Joi.string().optional(),
        address: Joi.string().optional(),
        note: Joi.string().optional(),
        dueDate: Joi.string().optional(),
        currency: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
        qualifymeta: Joi.object({
            orderValue: Joi.number().required(),
            actualOrderValue: Joi.number().required(),
            interest: Joi.string().required(),
            margin: Joi.number().required(),
            close: Joi.number().required(),
            startdate: Joi.string().required(),
            expectedclosingdate: Joi.string().required(),
            duedate: Joi.string().required(),
            nextaction: Joi.string().required(),
            productdescription: Joi.string().required(),
            pipelineName: Joi.string().required(),
            pipelinestagenumber: Joi.number().required()
        }).optional()
    })
};

exports.qualifyLeadById = {
    body: Joi.object({
        orderValue: Joi.number().required(),
        actualOrderValue: Joi.number().required(),
        interest: Joi.string().required(),
        margin: Joi.number().required(),
        close: Joi.number().required(),
        startdate: Joi.string().required(),
        expectedclosingdate: Joi.string().required(),
        duedate: Joi.string().required(),
        nextaction: Joi.string().required(),
        productdescription: Joi.string().required(),
        pipelineName: Joi.string().required(),
        pipelinestagenumber: Joi.number().required()
    })
};

exports.createProspect = {
    body: Joi.object({
        companyName: Joi.string().required(),
        salesPerson: Joi.string().required(),
        website: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
        note: Joi.string().allow(''),
        currency: Joi.string().required(),
        dueDate: Joi.string().optional(),
        qualifymeta: Joi.object({
            pipelineName: Joi.string().required(),
            pipelinestagenumber: Joi.number().required()
        }),
        isActive: Joi.boolean().required()
    })
};

exports.addLeadFinance = {
    body: Joi.object({
        paymentTermsId: Joi.string().required(),
        vatGroupId: Joi.string().optional(),
        vatStatus: Joi.string().required(),
        vatNumber: Joi.number().optional(),
        discount: Joi.number().required(),
        comment: Joi.string().allow(null)
    })
};

exports.changePipelineStage = {
    body: Joi.object({
        pipelineName: Joi.string().required()
    })
};