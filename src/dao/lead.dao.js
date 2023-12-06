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