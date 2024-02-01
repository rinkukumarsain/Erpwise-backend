// Local Import
const { agentModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');
const { generateId } = require('../utils/generateId');

const LOG_ID = 'services/agentService';

/**
 * Create a new agent.
 *
 * @param {object} auth - The authenticated user information.
 * @param {object} body - The request body containing agent information.
 * @param {string} orgId - The request headers conotaining id of organization.
 * @returns {Promise<object>} - A promise that resolves to an object with the success status, message, and data.
 */
exports.createAgent = async (auth, body, orgId) => {
    try {
        // Check if the email is unique
        const checkUniqueEmail = await query.findOne(agentModel, { email: body.email });
        if (checkUniqueEmail) {
            return {
                success: false,
                message: 'This email is already taken. Please choose a different one.',
                data: { email: body.email }
            };
        }

        // Set createdBy, updatedBy, organisationId and Id properties
        body.createdBy = auth._id;
        body.updatedBy = auth._id;
        body.organisationId = orgId;
        body.Id = generateId('A');

        // Insert the agent
        let insertAgent = await query.create(agentModel, body);

        // Check if the agent was inserted successfully
        if (insertAgent) {
            return {
                success: true,
                message: `${body.name}(Agent) created successfully.`,
                data: insertAgent
            };
        } else {
            return {
                success: false,
                message: 'Error while creating agent.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during createAgent: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};



/**
 *  Read operation - Get all agents
 * 
 * @param {string} orgId - organisational id from headers
 * @returns {object} - An object
 */
exports.getAllAgent = async (orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const agentList = await query.find(agentModel, { organisationId: orgId, isActive: true, isDeleted: false });
        if (agentList.length == 0) {
            return {
                success: true,
                message: 'Agents not found!',
                data: []
            };
        }
        return {
            success: true,
            message: 'Agents fetched successfully!',
            data: agentList
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all agents: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit agent by id.
 *
 * @param {string} id - The id of agent.
 * @param {object} auth - The authenticated user information.
 * @param {object} body - The request body containing agent information.
 * @param {string} orgId - The request headers containing id of organization.
 * @returns {Promise<object>} - A promise that resolves to an object with the success status, message, and data.
 */
exports.edit = async (id, auth, body, orgId) => {
    try {
        const agent = await query.findOne(agentModel, { _id: id, organisationId: orgId, isDeleted: false });
        if (!agent) {
            return {
                success: false,
                message: 'agent not found!'
            };
        }
        if (body.email) {
            // Check if the email is unique
            const checkUniqueEmail = await query.findOne(agentModel, { email: body.email, _id: { $ne: id } });
            if (checkUniqueEmail) {
                return {
                    success: false,
                    message: 'This agent email is already taken. Please choose a different one.',
                    data: { email: body.email }
                };
            }
        }
        body.updatedBy = auth._id;
        const updateagent = await agentModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (updateagent) {
            return {
                success: true,
                message: 'agent updated successfully.',
                data: updateagent
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during updating agent by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Delete agent by id.
 *
 * @param {string} id - The id of agent.
 * @param {string} orgId - The request headers containing id of organization.
 * @returns {Promise<object>} - A promise that resolves to an object with the success status, message, and data.
 */
exports.delete = async (id, orgId) => {
    try {
        const agent = await query.findOne(agentModel, { _id: id, organisationId: orgId, isDeleted: false });
        if (!agent) {
            return {
                success: false,
                message: 'agent not found!'
            };
        }
        const deleteagent = await agentModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true, runValidators: true });
        if (deleteagent) {
            return {
                success: true,
                message: 'agent deleted successfully.'
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred during deleting agent by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};