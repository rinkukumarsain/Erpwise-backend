const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Generate an aggregation pipeline to fetch a user's profile.
 *
 * @param {string} orgId - The ID of the organisation.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getAllLeadPipeline = (orgId) => [
    {
        $match: {
            organisationId: new mongoose.Types.ObjectId(orgId)
        }
    },
    {
        $lookup:
        {
            from: 'currencies',
            let: {
                currencyId: '$currency'
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ['$_id', '$$currencyId']
                        }
                    }
                },
                {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0
                    }
                }
            ],
            as: 'result'
        }
    },
    {
        $addFields: {
            result: {
                $arrayElemAt: ['$result', 0]
            }
        }
    },
    {
        $addFields: {
            currencyText: {
                $concat: [
                    '$result.currencyShortForm',
                    ' (',
                    '$result.currencySymbol',
                    ')'
                ]
            }
        }
    }
];

/**
 * Generate an aggregation pipeline to fetch a all address's of a lead.
 *
 * @param {string} leadId - The ID of the lead.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getAllLeadAddressPipeline = (leadId) => [
    { '$match': { 'leadId': new mongoose.Types.ObjectId(leadId) } }, {
        '$lookup': {
            'from': 'leads',
            'localField': 'leadId',
            'foreignField': '_id',
            'pipeline': [{
                '$project': {
                    'isContactAdded': 0, 'isQualified': 0, 'isAddressAdded': 0,
                    'createdAt': 0, 'updatedAt': 0, 'isFinanceAdded': 0
                }
            }],
            'as': 'leadId'
        }
    }, { '$unwind': { 'path': '$leadId' } }
];

/**
 * Generate an aggregation pipeline to fetch a all contact's of a lead.
 *
 * @param {string} leadId - The ID of the lead.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getAllLeadContectPipeline = (leadId) => [
    { '$match': { 'leadId': new mongoose.Types.ObjectId(leadId) } }, {
        '$lookup': {
            'from': 'leads',
            'localField': 'leadId',
            'foreignField': '_id',
            'pipeline': [{
                '$project': {
                    'isContactAdded': 0, 'isQualified': 0, 'isAddressAdded': 0,
                    'createdAt': 0, 'updatedAt': 0, 'isFinanceAdded': 0
                }
            }],
            'as': 'leadId'
        }
    }, { '$unwind': { 'path': '$leadId' } }
];