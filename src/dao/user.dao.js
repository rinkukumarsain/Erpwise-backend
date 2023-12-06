const mongoose = require('mongoose');
// const moment = require('moment');

/**
 * Generate an aggregation pipeline to fetch a user's profile.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Array} - An array representing the aggregation pipeline.
 */
exports.userProfsuilePipeline = (userId) => [
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

/**
 * Generates an aggregation pipeline to retrieve a paginated list of users.
 *
 * @typedef {object} GetAllUsersOptions
 * @property {string} orgId - The organization's unique identifier.
 * @property {string} isActive - Filter users based on their activation status. Pass 'true' or 'false'.
 * @property {string} isRole - Filter users based on their role. Pass 'true' to filter by role.
 * @property {number} page - The current page for pagination.
 * @property {number} perPage - The number of users to display per page.
 */

/**
 * Generates an aggregation pipeline to retrieve a paginated list of users.
 *
 * @param {GetAllUsersOptions} options - Options to customize the user retrieval.
 * @returns {Array} - An aggregation pipeline to retrieve a paginated list of users.
 */
exports.getAllUsersPipeline = ({ orgId, isActive, isRole, page, perPage, sortBy, sortOrder }) => {
    let arr = [
        {
            $match: {
                organisationId: new mongoose.Types.ObjectId(orgId)
            }
        },
        {
            $sort: {
                // 'updatedAt': -1
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
    if (sortBy && sortOrder) {
        arr[1]['$sort'][sortBy] = sortOrder === 'desc' ? -1 : 1;
    }
    console.log('>>>>>>>>>>>>>>>>>>>>>>', JSON.stringify(arr));
    return arr;
};