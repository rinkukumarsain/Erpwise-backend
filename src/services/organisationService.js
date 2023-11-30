const { organisationModel } = require('../dbModel'); // Assuming your model file is in the same directory
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/organisationService';

// Create operation
exports.createOrganisation = async (organisationData) => {
    try {
        const result = await query.create(organisationModel, organisationData);
        return {
            success: true,
            message: 'Organisation created successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while creating organisation: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

// Read operation - Get all organisations
exports.getAllOrganisations = async () => {
    try {
        const organisations = await query.find(organisationModel);
        if (!organisations.length) {
            return {
                success: false,
                message: 'No organisation found!'
            };
        }
        return {
            success: true,
            message: 'Organisation data fetched successfully!',
            data: organisations,
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all organisations: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

// Read operation - Get organisation by ID
exports.getOrganisationById = async (organisationId) => {
    try {
        const organisation = await query.findById(organisationModel, organisationId);
        if (organisation) {
            return {
                success: false,
                message: 'No organisation found!'
            };
        }
        return {
            success: true,
            message: 'Organisation data fetched successfully!',
            data: organisation,
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting organisation by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}
