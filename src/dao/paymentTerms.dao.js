// const mongoose = require('mongoose');

/**
 * Options for customizing the lead retrieval.
 *
 * @typedef {object} QueryOpetions
 * @property {boolean} isActive - Filter leads based on their activation status.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of leads to display per page.
 * @property {string} sortBy - Field to sort by.
 * @property {string} sortOrder - Sort order.
 * @property {string} search - complete search on all fields.
 * @property {string} salesPerson - search on sales person.
 * @property {number} level - The level of the lead.
 */

/**
 * Generates an aggregation pipeline to retrieve all payment terms for dashboard
 *
 * @param {QueryOpetions} options - Options to customize the lead retrieval.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllPaymentTermsForDashboardPipeline = ({ isActive, page, perPage, sortBy, sortOrder, search }) => {
    let pipeline = [];

    if (search) {
        let obj = {
            '$match': {
                '$or': [
                    { name: { $regex: `${search}.*`, $options: 'i' } },
                    { noOfDays: { $eq: +search ? +search : search } }
                ]
            }
        };
        pipeline.push(obj);
    }
    if (isActive) {
        let obj = {
            '$match': {
                isActive: isActive === 'false' ? false : true
            }
        };
        pipeline.push(obj);
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