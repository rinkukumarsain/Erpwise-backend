const mongoose = require('mongoose');

/**
 * Options for customizing the agent retrieval.
 *
 * @typedef {object} QueryOpetions
 * @property {boolean} isActive - Filter leads based on their activation status.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of leads to display per page.
 * @property {string} sortBy - Field to sort by.
 * @property {string} sortOrder - Sort order.
 * @property {string} search - complete search on all fields.
 */

/**
 * Generates an aggregation pipeline to retrieve all agent for dashboard
 *
 * @param {string} orgId - Id of a organization.
 * @param {QueryOpetions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllAgentPipeline = (orgId, { isActive, page, perPage, sortBy, sortOrder, search }) => {
    let pipeline = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                isDeleted: false
            }
        },
        {
            $lookup: {
                from: 'paymentterms',
                localField: 'paymentTermsId',
                foreignField: '_id',
                as: 'paymentterm'
            }
        },
        {
            $unwind: {
                path: '$paymentterm',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'vats',
                localField: 'vatGroupId',
                foreignField: '_id',
                as: 'vat'
            }
        },
        {
            $unwind: {
                path: '$vat',
                preserveNullAndEmptyArrays: true
            }
        }
    ];

    if (search) {
        let obj = {
            '$match': {
                '$or': [
                    { name: { $regex: `${search}.*`, $options: 'i' } },
                    { Id: { $regex: `${search}.*`, $options: 'i' } },
                    { email: { $regex: `${search}.*`, $options: 'i' } },
                    { mobile: { $regex: `${search}.*`, $options: 'i' } },
                    { billingAdd1: { $regex: `${search}.*`, $options: 'i' } },
                    { billingAdd2: { $regex: `${search}.*`, $options: 'i' } },
                    { city: { $regex: `${search}.*`, $options: 'i' } },
                    { country: { $regex: `${search}.*`, $options: 'i' } },
                    { percentage: { $eq: +search ? +search : search } },
                    { 'vat.name': { $regex: `${search}.*`, $options: 'i' } },
                    { 'vat.percentage': { $eq: +search ? +search : search } },
                    { 'paymentterm.name': { $regex: `${search}.*`, $options: 'i' } },
                    { 'paymentterm.noOfDays': { $eq: +search ? +search : search } }
                ]
            }
        };
        pipeline.push(obj);
    }

    if (isActive) {
        pipeline.push({
            $match: {
                isActive: isActive === 'false' ? false : true
            }
        });
    }
    if (sortBy && sortOrder) {
        let obj = {
            '$sort': {
                [sortBy]: sortOrder === 'desc' ? -1 : 1
            }
        };
        pipeline.push(obj);
    }
    pipeline.push({
        $skip: (page - 1) * perPage
    });
    pipeline.push({
        $limit: perPage
    });
    return pipeline;
};