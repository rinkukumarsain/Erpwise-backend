const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Generate an aggregation pipeline to fetch a user's profile.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.userProfilePipeline = (userId) => [
    {
        $match: {
            _id: new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $project: {
            password: 0, // Excluding the 'password' field from the result
            token: 0
        }
    }
];


exports.getAllUsersPipeline = ({ orgId, isActive, isRole, page, perPage }) => {
    let arr = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId)
            }
        },
        {
            $sort: {
                'updatedAt': -1
            }
        },
        {
            $skip: (page - 1) * perPage
        },
        {
            $limit: perPage
        }
    ];

    if (isActive) {
        arr[0]['$match']['isActive'] = isActive === 'true' ? true : false;
    }
    if (isRole && isRole == 'true') {
        arr[0]['$match']['$or'] = [
            { role: 'admin' },
            { role: 'sales' }
        ];
    }
    console.log('>>>>>>>>>>>>>>>>>>>>>>', JSON.stringify(arr));
    return arr;
};