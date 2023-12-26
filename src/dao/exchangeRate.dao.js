const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Generates an aggregation pipeline to retrieve a paginated list of users.
 *
 * @typedef {object} getExchangeRatePipeline
 * @property {string} orgId - The organization's unique identifier.
 * @property {string} isActive - Filter users based on their activation status. Pass 'true' or 'false'.
 */

/**
 * Generates an aggregation pipeline to retrieve a paginated list of users.
 *
 * @param {getExchangeRatePipeline} options - Options to customize the user retrieval.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated list of users.
 */

exports.getExchangeRatePipeline = ({ orgId, isActive }) => {
    let condition = [];
    let matchObj = {};
    if (orgId) { matchObj['orgId'] = new mongoose.Types.ObjectId(orgId); }
    isActive ? matchObj['isActive'] = isActive : matchObj['isActive'] = true;

    condition.push({ '$match': matchObj }, {
        '$lookup': {
            'from': 'organisations',
            'localField': 'orgId',
            'foreignField': '_id',
            'pipeline': [{ '$project': { 'createdAt': 0, 'updatedAt': 0, 'currency': 0 } }],
            'as': 'orgId'
        }
    }, {
        '$lookup': {
            'from': 'currencies',
            'localField': 'orgCurrency',
            'foreignField': '_id',
            'pipeline': [{ '$project': { 'create_date': 0, 'last_updated': 0 } }],
            'as': 'orgCurrency'
        }
    }, { '$unwind': { 'path': '$currencyRate' } }, { '$unset': 'currencyRate._id' }, {
        '$lookup': {
            'from': 'currencies',
            'localField': 'currencyRate.currencyId',
            'foreignField': '_id',
            'pipeline': [{ '$project': { 'create_date': 0, 'last_updated': 0 } }],
            'as': 'currencyRate.currencyId'
        }
    }, {
        '$addFields': {
            'orgId': { '$arrayElemAt': ['$orgId', 0] },
            'orgCurrency': { '$arrayElemAt': ['$orgCurrency', 0] },
            'currencyRate.currencyId': { '$arrayElemAt': ['$currencyRate.currencyId', 0] }
        }
    }, {
        '$addFields': {
            'currencyRate.string': {
                '$concat': ['$orgCurrency.currencySymbol', '1', ' = ', '$currencyRate.currencyId.currencySymbol', {
                    '$toString': '$currencyRate.currencyRate'
                }]
            },
            'days': { '$divide': [{ '$subtract': ['$endDate', '$startDate'] }, 24 * 60 * 60 * 1000] }
        }
    }, {
        '$group': {
            '_id': '$_id',
            'currencyRate': { '$push': '$currencyRate' },
            'orgCurrency': { '$first': '$orgCurrency' },
            'orgId': { '$first': '$orgId' },
            'startDate': { '$first': '$startDate' },
            'endDate': { '$first': '$endDate' },
            'days': { '$first': '$days' },
            'isActive': { '$first': '$isActive' },
            'Activity': { '$first': '$Activity' }
        }
    });
    return condition;
};