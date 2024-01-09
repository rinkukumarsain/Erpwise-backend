// const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Generate an aggregation pipeline to fetch a user's profile.
 *
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.getAllOrgPipeline = () => [
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
            as: 'baseCurrencyData'
        }
    },
    {
        $unwind: {
            path: '$baseCurrencyData',
            preserveNullAndEmptyArrays: true
        }
    }
];