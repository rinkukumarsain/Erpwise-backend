const mongoose = require('mongoose');

/**
 * Generates an aggregation pipeline to retrieve all warehouse.
 *
 * @param {string} orgId - The organissation unique identifier.
 * @returns {Array} - An aggregation pipeline
 */
exports.getAllWarehousePipeline = (orgId) => [
    {
        $match: {
            isDeleted: false,
            organisationId: new mongoose.Types.ObjectId(orgId)
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'managers',
            foreignField: '_id',
            pipeline: [
                {
                    $project: {
                        password: 0,
                        token: 0
                    }
                }
            ],
            as: 'managers'
        }
    }
];