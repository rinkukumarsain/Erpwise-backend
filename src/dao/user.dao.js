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