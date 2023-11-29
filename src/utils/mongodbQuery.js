/**
 * Execute an aggregation query on a Mongoose model.
 *
 * @param {model} model - The Mongoose model to perform the aggregation on.
 * @param {Array} pipeline - The aggregation pipeline containing stages.
 * @returns {Promise<Array>} - A promise that resolves to the result of the aggregation query.
 * @throws {Error} If an error occurs during the aggregation process.
 */
const aggregation = async (model, pipeline) => {
    try {
        return await model.aggregate(pipeline, { maxTimeMS: 60000, allowDiskUse: true });
    } catch (error) {
        console.log('Error during aggregation:', error);
        throw error; // Re-throw the error for handling at a higher level if necessary.
    }
};

/**
 * Find a single document in the specified model.
 *
 * @param {model} model - The Mongoose model to query.
 * @param {object} query - The query conditions.
 * @param {object} [filter={}] - The fields to include or exclude from the result.
 * @param {object} [options={}] - Additional query options.
 * @returns {Promise<object|null>} - A promise that resolves to the found document or null if not found.
 * @throws {Error} If an error occurs during the query.
 */
const findOne = async (model, query, filter = {}, options = {}) => {
    try {
        return await model.findOne(query, filter, options);
    } catch (error) {
        console.error('Error during findOne:', error);
        throw error; // Re-throw the error for handling at a higher level if necessary.
    }
};


/**
 * Query utility functions.
 */
exports.query = {
    aggregation,
    findOne
};