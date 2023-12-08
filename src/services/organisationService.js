const { organisationModel } = require('../dbModel'); // Assuming your model file is in the same directory
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/organisationService';

// Create operation
/**
 *
 * @param {object} organisationData - data to be created
 */
exports.createOrganisation = async (organisationData) => {
    try {
        const checkcompanyName = await query.findOne(organisationModel, { companyName: organisationData.companyName });
        if (checkcompanyName) {
            return {
                success: false,
                message: 'Organisation company name already exist.',
                data: {
                    companyName: organisationData.companyName
                }
            };
        }

        const checkEmail = await query.findOne(organisationModel, { email: organisationData.email });
        if (checkEmail) {
            return {
                success: false,
                message: 'Organisation email already exist.',
                data: {
                    email: organisationData.email
                }
            };
        }

        const checkPhone = await query.findOne(organisationModel, { phone: organisationData.phone });
        if (checkPhone) {
            return {
                success: false,
                message: 'Organisation phone number already exist.',
                data: {
                    phone: organisationData.phone
                }
            };
        }

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
};

// Read operation - Get all organisations
/**
 *
 */
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
            data: organisations
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all organisations: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// Read operation - Get organisation by ID
/**
 *
 * @param {string} organisationId - organisation id
 */
exports.getOrganisationById = async (organisationId) => {
    try {
        const organisation = await query.findById(organisationModel, organisationId);
        if (!organisation) {
            return {
                success: false,
                message: 'No organisation found!'
            };
        }
        return {
            success: true,
            message: 'Organisation data fetched successfully!',
            data: organisation
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting organisation by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Update operation
 *
 * @param {string} organisationId - organisation id
 * @param {object} updateData - data to be updated
 */
exports.updateOrganisation = async (organisationId, updateData) => {
    try {

        if (updateData.companyName) {
            const checkcompanyName = await query.findOne(organisationModel, { _id: { $ne: organisationId }, companyName: updateData.companyName });
            if (checkcompanyName) {
                return {
                    success: false,
                    message: 'Organisation company name already exist.',
                    data: {
                        companyName: updateData.companyName
                    }
                };
            }
        }

        if (updateData.email) {
            const checkEmail = await query.findOne(organisationModel, { _id: { $ne: organisationId }, email: updateData.email });
            if (checkEmail) {
                return {
                    success: false,
                    message: 'Organisation email already exist.',
                    data: {
                        email: updateData.email
                    }
                };
            }
        }

        if (updateData.phone) {
            const checkPhone = await query.findOne(organisationModel, { _id: { $ne: organisationId }, phone: updateData.phone });
            if (checkPhone) {
                return {
                    success: false,
                    message: 'Organisation phone number already exist.',
                    data: {
                        phone: updateData.phone
                    }
                };
            }
        }

        const result = await organisationModel.findByIdAndUpdate(
            organisationId,
            { $set: updateData },
            { new: true }
        );
        if (!result) {
            return {
                success: false,
                message: 'Organisation not found!'
            };
        }
        return {
            success: true,
            message: 'Organisation updated successfully!',
            data: result
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while updating organisation: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};


/**
 * Upload org image.
 *
 * @param {string} orgId - The ID of the org.
 * @param {object} file - Parameters containing 'file details'.
 * @param {string} file.location - Parameters containing 'file location'.
 * @returns {object} - An object with the results, including user details.
 */
exports.uploadOrgimage = async (orgId, { location }) => {
    try {
        const findNdUpdateOrg = await organisationModel.findOneAndUpdate({ _id: orgId }, { image: location }, { new: true });

        if (!findNdUpdateOrg) {
            return {
                success: false,
                message: 'Error while uploading image.'
            };
        }

        return {
            success: true,
            message: `Image uploaded successfully.`,
            data: findNdUpdateOrg
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during uploading image of an organisation: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

