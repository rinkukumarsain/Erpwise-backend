const moment = require('moment');
// Local Import
const { enquiryModel, leadModel, enquiryItemModel } = require('../dbModel');
const { enquiryDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/enquiryService';

/**
 * Creates a new Enquiry.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} enquiryData - Data for creating a new enquiry.
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the new enquiry.
 */
exports.createEnquiry = async (auth, enquiryData, orgId) => {
    try {
        const { email, _id, fname, lname } = auth;
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry creation by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        enquiryData.Activity = [obj];
        enquiryData.createdBy = _id;
        enquiryData.updatedBy = _id;
        enquiryData.organisationId = orgId;
        enquiryData.Id = `EQ-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
        const newEnquiry = await query.create(enquiryModel, enquiryData);
        if (newEnquiry) {
            await leadModel.findByIdAndUpdate(
                enquiryData.leadId,
                { isMovedToEnquiry: true },
                { runValidators: true }
            );
            return {
                success: true,
                message: 'Enquiry created successfully.',
                data: newEnquiry
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error creating enquiry: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets all enquiry.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {object} queryObj - filters for getting all Enquiry.
 * @returns {object} - An object with the results, including all Enquiry.
 */
exports.getAllEnquiry = async (orgId, queryObj) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { isActive, page = 1, perPage = 10, sortBy, sortOrder, level, id, search, salesPerson, leadId } = queryObj;
        let obj = {
            organisationId: orgId,
            // level: level ? +level : 1,
            isDeleted: false
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        if (id) obj['_id'] = id;
        const enquiryListCount = await query.find(enquiryModel, obj, { _id: 1 });
        const totalPages = Math.ceil(enquiryListCount.length / perPage);
        const enquiryData = await query.aggregation(enquiryModel, enquiryDao.getAllEnquiryPipeline(orgId, { isActive, page: +page, perPage: +perPage, sortBy, sortOrder, level, leadId, enquiryId: id, search, salesPerson }));
        return {
            success: true,
            message: `Enquiry fetched successfully.`,
            data: {
                enquiryData,
                pagination: {
                    page,
                    perPage,
                    totalChildrenCount: enquiryListCount.length,
                    totalPages
                }
            }
        };
    } catch (error) {
        logger.error(LOG_ID, `Error fetching enquiry: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets enquiry By Id.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {string} enquiryId - Id of enquiry.
 * @returns {object} - An object with the results, including enquiry.
 */
exports.getEnquiryById = async (orgId, enquiryId) => {
    try {
        const enquiryData = await query.aggregation(enquiryModel, enquiryDao.getEnquiryByIdPipeline(orgId, enquiryId));
        if (!enquiryData) {
            return {
                success: false,
                message: 'No enquiry found!'
            };
        }
        return {
            success: true,
            message: 'Enquiry data fetched successfully.',
            data: enquiryData
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting enquiry by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Get Recommended Supplier With Items
 *
 * @param {string} enquiryId - Id of enquiry.
 * @returns {object} - An object with the results, including enquiry.
 */
exports.getRecommendedSupplierWithItems = async (enquiryId) => {
    try {
        const recommendedSupplierWithItems = await query.aggregation(enquiryItemModel, enquiryDao.getRecommendedSupplierWithItems(enquiryId));
        if (recommendedSupplierWithItems.length > 0) {
            return {
                success: true,
                message: 'Recommended supplier with items fetched successfully.',
                data: recommendedSupplierWithItems
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting Recommended Supplier With Items: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};