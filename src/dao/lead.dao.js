const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Generate an aggregation pipeline to fetch a user's profile.
 *
 * @param {string} orgId - The ID of the organisation.
 * @param {object} query - filters for getting all leads.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getAllLeadPipeline = (orgId, query) => {
    let arr = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId),
                level: 1
            }
        },
        {
            $lookup: {
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
            $lookup: {
                from: 'users',
                localField: 'salesPerson',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $addFields: {
                result: {
                    $arrayElemAt: ['$result', 0]
                },
                userDetails: {
                    $arrayElemAt: ['$userDetails', 0]
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
                },
                salesPersonName: {
                    $concat: [
                        '$userDetails.fname',
                        ' ',
                        '$userDetails.lname'
                    ]
                }
            }
        },
        {
            $project: {
                result: 0,
                userDetails: 0
            }
        },
        {
            $lookup: {
                from: 'leadcontacts',
                localField: '_id',
                foreignField: 'leadId',
                as: 'leadContacts'
            }
        },
        {
            $lookup: {
                from: 'leadaddresses',
                localField: '_id',
                foreignField: 'leadId',
                as: 'leadAddresses'
            }
        }
    ];

    if (query.level) {
        arr[0]['$match']['level'] = +query.level;
    }

    return arr;
};

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