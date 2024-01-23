const moment = require('moment');

// Local Import
const {
    enquiryModel,
    leadModel,
    enquiryItemModel,
    enquirySupplierSelectedItemsModel,
    enquiryQuoteModel,
    mailLogsModel,
    enquirySupplierPOModel
} = require('../dbModel');
const { enquiryDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');
const { sendMail } = require('../utils/sendMail');
const { generateId } = require('../utils/generateId');
const { CRMlevelEnum } = require('../../config/default.json');

const LOG_ID = 'services/enquiryService';

/**
 * Get Sales Dashboard Count.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the new enquiry.
 */
exports.enquiryDashboardCount = async (orgId) => {
    try {
        const findCount = await query.aggregation(enquiryModel, enquiryDao.getSalesDashboardCount(orgId));
        let obj = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0
        };
        if (findCount.length > 0) for (let ele of findCount) obj[ele._id] = ele.count;

        return {
            success: true,
            message: 'Sales dashboard count.',
            data: obj
        };
    } catch (error) {
        logger.error(LOG_ID, `Error creating enquiry: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};


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
        enquiryData.Id = generateId('EQ');
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
 * Update Enquiry.
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} enquiryId - Id of enquiry.
 * @param {object} enquiryData - Data for creating a new enquiry.
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the new enquiry.
 */
exports.updateEnquiryById = async (auth, enquiryId, enquiryData, orgId) => {
    try {
        const { email, _id, fname, lname } = auth;
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, organisationId: orgId, isDeleted: false });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isItemShortListed) {
            return {
                success: false,
                message: 'Enquiry Items are already short listed you can not add or edit enquiry.'
            };
        }
        if (enquiryData.totalOrderValue) {
            const findTotalAmount = await query.aggregation(enquiryItemModel, enquiryDao.getEnquiryItemTotalForCheckToTotalOrderValue(enquiryId));
            if ((findTotalAmount[0]?.totalPrice || 0) > +enquiryData.totalOrderValue) {
                return {
                    success: false,
                    message: `The total order value of the enquiry cannot be less than the total price(${findTotalAmount[0].totalPrice}) of the current items.`
                };
            }
        }
        enquiryData.updatedBy = _id;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `${findEnquiry.Id} | Enquiry updated by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        enquiryData['$push'] = { Activity: obj };
        const update = await enquiryModel.findByIdAndUpdate(
            enquiryId,
            enquiryData,
            { new: true, runValidators: true }
        );
        if (update) {
            return {
                success: true,
                message: 'Enquiry updated successfully.',
                data: update
            };
        }
        return {
            success: false,
            message: 'Error while updating enquiry.'
        };
    } catch (error) {
        logger.error(LOG_ID, `Error updating enquiry: ${error}`);
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
 * Delete enquiry By Id.
 *
 * @param {string} enquiryId - Id of enquiry.
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including enquiry.
 */
exports.deleteEnquiry = async (enquiryId, orgId) => {
    try {
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, organisationId: orgId, isDeleted: false });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.level > 1 || findEnquiry.isItemShortListed) {
            return {
                success: false,
                message: 'Deletion of the enquiry is not permitted.'
            };
        }
        const deleteEnquiry = await enquiryModel.findByIdAndUpdate(
            enquiryId,
            { isDeleted: true },
            { new: true, runValidators: true }
        );
        if (deleteEnquiry) {
            return {
                success: true,
                message: 'Enquiry deleted successfully.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while deleting enquiry by id: ${error}`);
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
 * @param {string} orgId - Id of org.
 * @returns {object} - An object with the results, including enquiry.
 */
exports.getRecommendedSupplierWithItems = async (enquiryId, orgId) => {
    try {
        // const enquiryData = await query.aggregation(enquiryModel, enquiryDao.getEnquiryByIdPipelineForSendMail(orgId, enquiryId));
        const recommendedSupplierWithItems = await query.aggregation(enquiryItemModel, enquiryDao.getRecommendedSupplierWithItems(enquiryId));
        const recommendedSupplierWithCount = await query.aggregation(enquirySupplierSelectedItemsModel, enquiryDao.getRecommendedSupplierWithItemsCount(orgId, enquiryId));
        if (recommendedSupplierWithItems.length > 0) {
            return {
                success: true,
                message: 'Recommended supplier with items fetched successfully.',
                data: recommendedSupplierWithItems,
                enquiry: recommendedSupplierWithCount[0]
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

/**
 * Upload enquiry Document.
 *
 * @param {string} enquiryId - The ID of the enquiry.
 * @param {object} file - Parameters containing 'file details'.
 * @param {string} file.location - Parameters containing 'file location'.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including enquiry details.
 */
exports.uploadEnquiryDocument = async (enquiryId, { location }, auth) => {
    try {
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Enquiry document uploaded by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const findAndUpdateLeadDocument = await enquiryModel.findOneAndUpdate({ _id: enquiryId }, { $push: { documents: location, Activity: obj }, updatedBy: auth._id }, { new: true });

        if (!findAndUpdateLeadDocument) {
            return {
                success: false,
                message: 'Error while uploading enquiry document.'
            };
        }

        return {
            success: true,
            message: `Enquiry document uploaded successfully.`,
            data: findAndUpdateLeadDocument
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching uploading enquiry document (uploadEnquiryDocument): ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * delete enquiry Document.
 *
 * @param {string} enquiryId - The ID of the enquiry.
 * @param {string} imageUrl - Parameters containing 'file url'.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including enquiry details.
 */
exports.deleteEnquiryDocument = async (enquiryId, imageUrl, auth) => {
    try {
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Enquiry document deleted by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const updateDocument = await enquiryModel.findOneAndUpdate({ _id: enquiryId }, { $pull: { documents: imageUrl }, $push: { Activity: obj } }, { new: true });

        if (!updateDocument) {
            return {
                success: false,
                message: 'Error while deleting enquiry document.'
            };
        }

        return {
            success: true,
            message: `Enquiry document deleted successfully.`,
            data: updateDocument
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching deleting enquiry document (deleteEnquiryDocument): ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Get mail logs
 *
 * @param {string} type - The supplier's unique identifier.
 * @param {string} enquiryId - The enquiry's unique identifier.
 * @returns {object} - An object with the results.
 */
exports.getMailLogs = async (type, enquiryId) => {
    try {
        const mailLogs = await query.aggregation(mailLogsModel, enquiryDao.getMailLogsPipeline(type, enquiryId));
        return {
            success: true,
            message: 'Previous mail logs fetched successfully.',
            data: mailLogs
        };
    } catch (error) {
        logger.error(LOG_ID, `Error While fetching mail logs: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};


// ========================= QUOTE ============================= //

/**
 * add enquiry Quote.
 *
 * @param {object} auth - req auth.
 * @param {object} body - req body.
 * @param {string} orgId - The ID of the organization.
 * @returns {object} - An object with the results, including enquiry details.
 */
exports.createQuote = async (auth, body, orgId) => {
    try {
        const { email, _id, fname, lname } = auth;
        const findEnquiry = await query.findOne(enquiryModel, { _id: body.enquiryId, organisationId: orgId, isDeleted: false, isItemShortListed: true });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isPiCreated) {
            return {
                success: false,
                message: 'Enquiry porforma invoice is already created.'
            };
        }

        const findFinalItems = await query.find(enquirySupplierSelectedItemsModel, { enquiryId: body.enquiryId, isShortListed: true, isDeleted: false }, { _id: 1 });
        if (findFinalItems.length == 0) {
            return {
                success: false,
                message: 'No item found'
            };
        }
        const findTotalQuotes = await query.find(enquiryQuoteModel, { enquiryId: body.enquiryId, isDeleted: false }, { _id: 1 });
        if (findTotalQuotes.length == 3) {
            return {
                success: false,
                message: 'Three quotes are already created.'
            };
        }

        body.enquiryFinalItemId = findFinalItems.map(e => e._id);
        body.organisationId = orgId;
        body.createdBy = _id;
        body.updatedBy = _id;
        body.leadId = findEnquiry.leadId;
        body.leadContactId = findEnquiry.leadContactId;
        body.Id = generateId('Q');
        const saveQuote = await query.create(enquiryQuoteModel, body);
        if (saveQuote) {
            if (findTotalQuotes.length > 0) {
                const ids = findTotalQuotes.map(e => e._id);
                await enquiryQuoteModel.updateMany({ _id: { $in: ids }, isActive: true }, { $set: { isActive: false } });
            }
            const obj = {
                performedBy: _id,
                performedByEmail: email,
                actionName: `Enquiry quote creation by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
            };
            await enquiryModel.findByIdAndUpdate(
                body.enquiryId,
                { $push: { Activity: obj }, level: 2, isQuoteCreated: true, stageName: 'Create_PI', quoteId: saveQuote._id },
                { new: true, runValidators: true }
            );
            return {
                success: true,
                message: 'Enquiry quote created successfully.',
                data: saveQuote
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding Quote: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * delete enquiry Quote.
 *
 * @param {string} id - id of quote.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including enquiry details.
 */
exports.deleteQuote = async (id, auth) => {
    try {
        const { email, _id, fname, lname } = auth;
        const findQuote = await query.findOne(enquiryQuoteModel, { _id: id, isDeleted: false });
        if (!findQuote) {
            return {
                success: false,
                message: 'Quote not found.'
            };
        }
        const findEnquiry = await query.findOne(enquiryModel, { _id: findQuote.enquiryId, isDeleted: false, isItemShortListed: true });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isPiCreated) {
            return {
                success: false,
                message: 'Enquiry porforma invoice is already created.'
            };
        }
        let chekUpdate = false;
        const findActiveQuote = await query.find(enquiryQuoteModel, { enquiryId: findQuote.enquiryId, _id: { $ne: id }, isDeleted: false });
        if (findActiveQuote.length == 0) {
            chekUpdate = true;
        }

        let quoteId = null;
        if (!chekUpdate && findQuote.isActive) {
            const findQuoteData = await enquiryQuoteModel.find({ isDeleted: false, isActive: false }).sort({ createdAt: -1 }).limit(1);
            quoteId = findQuoteData[0]._id;
            await enquiryQuoteModel.findByIdAndUpdate(quoteId, { isActive: true }, { new: true, runValidators: true });
        }
        const deleteQuote = await enquiryQuoteModel.findByIdAndUpdate(id, { isDeleted: true, isActive: false }, { new: true, runValidators: true });
        if (deleteQuote) {
            if (findQuote.isActive) {
                const obj = {
                    performedBy: _id,
                    performedByEmail: email,
                    actionName: `Enquiry quote deleted (id: ${id}) by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
                };
                let update = { $push: { Activity: obj } };
                if (quoteId) update['quoteId'] = quoteId;
                if (chekUpdate) {
                    update['stageName'] = 'Create_Quote';
                    update['isQuoteCreated'] = false;
                    update['quoteId'] = null;
                    update['level'] = 1;
                }
                await enquiryModel.findByIdAndUpdate(
                    findQuote.enquiryId,
                    update,
                    { new: true, runValidators: true }
                );
            }
            return {
                success: true,
                message: 'Quote deleted successfully.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during deliting quote by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// /**
//  * edit enquiry Quote.
//  *
//  * @param {string} id - quote id.
//  * @param {object} auth - req auth.
//  * @param {object} body - req body.
//  * @returns {object} - An object with the results, including enquiry details.
//  */
// exports.updateQuote = async (id, auth, body) => {
//     try {
//         const findEnquiry = await query.findOne(enquiryModel, { _id: body.enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true });
//         if (!findEnquiry) {
//             return {
//                 success: false,
//                 message: 'Enquiry not found'
//             };
//         }
//         if (findEnquiry.isPiCreated) {
//             return {
//                 success: false,
//                 message: 'Enquiry porforma invoice is already created.'
//             };
//         }
//         const { email, _id, fname, lname } = auth;
//         body.updatedBy = _id;
//         const editQuote = await enquiryQuoteModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
//         if (editQuote) {
//             const obj = {
//                 performedBy: _id,
//                 performedByEmail: email,
//                 actionName: `Enquiry quote(id: ${id}) edited by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
//             };
//             await enquiryModel.findByIdAndUpdate(
//                 body.enquiryId,
//                 { $push: { Activity: obj } },
//                 { new: true, runValidators: true }
//             );
//             return {
//                 success: true,
//                 message: 'Enquiry quote edited successfully.',
//                 data: editQuote
//             };
//         }
//     } catch (error) {
//         logger.error(LOG_ID, `Error occurred during adding Quote: ${error}`);
//         return {
//             success: false,
//             message: 'Something went wrong'
//         };
//     }
// };

/**
 * get all enquiry Quote's.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} id - quote id.
 * @returns {object} - An object with the results.
 */
exports.getQuote = async (enquiryId, id) => {
    try {
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        const getQuote = await query.aggregation(enquiryQuoteModel, enquiryDao.getQuotePipeline(enquiryId, id));
        if (getQuote) {
            return {
                success: true,
                message: 'Enquiry quote fetched successfully.',
                data: id ? getQuote[0] : getQuote,
                stageName: findEnquiry?.stageName,
                isPiCreated: findEnquiry?.isPiCreated,
                pi_id: findEnquiry?.proformaInvoice?._id
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during getting Quote: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets all enquiry Quote for dashboard of sales.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {object} queryObj - filters for getting all Enquiry.
 * @returns {object} - An object with the results, including all Enquiry.
 */
exports.getAllQuote = async (orgId, queryObj) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { isActive, page = 1, perPage = 10, sortBy, sortOrder, search } = queryObj;
        let obj = {
            organisationId: orgId,
            isDeleted: false
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        const enquiryListCount = await query.find(enquiryModel, obj, { _id: 1 });
        const totalPages = Math.ceil(enquiryListCount.length / perPage);
        const enquiryData = await query.aggregation(enquiryModel, enquiryDao.getAllQuotePipeline(orgId, { isActive, page: +page, perPage: +perPage, sortBy, sortOrder, search }));
        return {
            success: true,
            message: `Enquiry Quote fetched successfully.`,
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
 * Send Mail For Enquiry quote
 *
 * @param {object} updateData - Data of Enquiry Supplier Selected Item.
 * @param {object} file - Data of uploaded sheet of Enquiry Supplier Selected Items.
 * @returns {object} - An object with the results.
 */
exports.sendMailForEnquiryQuote = async (updateData, file) => {
    try {
        const findenquiry = await query.findOne(enquiryModel, { _id: updateData.enquiryId, isActive: true, isDeleted: false, isQuoteCreated: true });
        // console.log('findenquiry>>>>>>>>>>>>>', findenquiry);
        if (!findenquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }

        // if (findenquiry.isPiCreated) {
        //     return {
        //         success: false,
        //         message: 'Enquiry porforma invoice already created.'
        //     };
        // }
        const mailDetails = {
            enquiryId: updateData.enquiryId,
            quoteId: updateData.quoteId,
            type: 'enquiryQuote'
        };
        sendMailFun(
            updateData.to,
            updateData.cc,
            updateData.subject,
            updateData.body,
            file,
            mailDetails
        );
        return {
            success: true,
            message: `Enquiry quote mail sent.`,
            data: updateData.quoteId
        };
        // }
    } catch (error) {
        logger.error(LOG_ID, `Error while send Mail For Enquiry Supplier Selected Item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// ========================= PI ============================= //


/**
 * Add enquiry Porforma Invoice.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {object} auth - req auth.
 * @param {object} body - req body.
 * @returns {object} - An object with the results.
 */
exports.createPI = async (enquiryId, auth, body) => {
    try {
        const { email, _id, fname, lname } = auth;
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isPiCreated) {
            return {
                success: false,
                message: 'Enquiry porforma invoice already created.'
            };
        }
        const findQuote = await query.findOne(enquiryQuoteModel, { _id: body.quoteId, enquiryId, isDeleted: false });
        if (!findQuote) {
            return {
                success: false,
                message: 'Quote not found.'
            };
        }
        body.createdBy = _id;
        body.updatedBy = _id;
        body.Id = generateId('PI');
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry porforma invoice creation by ${fname} ${lname} from quote Id : ${body.quoteId} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const createPI = await enquiryModel.findByIdAndUpdate(enquiryId,
            {
                proformaInvoice: body,
                quoteId: body.quoteId,
                $push: { Activity: obj },
                level: 3,
                isPiCreated: true,
                stageName: 'Create_Sales_Order'
            },
            { new: true, runValidators: true });
        if (createPI) {
            if (!findQuote.isActive) {
                await enquiryQuoteModel.updateMany({ _id: { $ne: body.quoteId } }, { $set: { isActive: false } });
                await enquiryQuoteModel.updateOne({ _id: body.quoteId }, { $set: { isActive: true } });
            }
            return {
                success: true,
                message: 'Enquiry porforma invoice created successfully.',
                data: createPI
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding PI: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * get enquiry Porforma Invoice by enquiry id.
 *
 * @param {string} enquiryId - enquiry id.
 * @returns {object} - An object with the results.
 */
exports.getPiById = async (enquiryId) => {
    try {
        const findPiData = await query.aggregation(enquiryModel, enquiryDao.getPiByIdPipeline(enquiryId));
        if (findPiData) {
            return {
                success: true,
                message: 'Enquiry performa invoice data.',
                data: findPiData[0]
            };
        }
        return {
            success: false,
            message: 'Enquiry performa invoice data not found.',
            data: {}
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during getting PI by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets all enquiry Porforma Invoice for dashboard of sales.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {object} queryObj - filters for getting all Enquiry.
 * @returns {object} - An object with the results, including all Enquiry.
 */
exports.getAllPorformaInvoice = async (orgId, queryObj) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { isActive, page = 1, perPage = 10, sortBy, sortOrder, search } = queryObj;
        let obj = {
            organisationId: orgId,
            isDeleted: false
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        const enquiryListCount = await query.find(enquiryModel, obj, { _id: 1 });
        const totalPages = Math.ceil(enquiryListCount.length / perPage);
        const enquiryData = await query.aggregation(enquiryModel, enquiryDao.getAllPorformaInvoicePipeline(orgId, { isActive, page: +page, perPage: +perPage, sortBy, sortOrder, search }));
        return {
            success: true,
            message: `Enquiry porforma invoice fetched successfully.`,
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
        logger.error(LOG_ID, `Error fetching enquiry porforma invoice for dashboard of sales: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * edit enquiry Porforma Invoice.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {object} auth - req auth.
 * @param {object} body - req body.
 * @returns {object} - An object with the results, including enquiry Porforma Invoice details.
 */
exports.updatePI = async (enquiryId, auth, body) => {
    try {
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true, isPiCreated: true });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isSalesOrderCreated) {
            return {
                success: false,
                message: 'Enquiry sales order is already created.'
            };
        }
        const { email, _id, fname, lname } = auth;
        body.updatedBy = _id;
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry porforma invoice(id: ${findEnquiry.proformaInvoice._id}) edited by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const editQuote = await enquiryModel.findByIdAndUpdate(enquiryId, { proformaInvoice: body, $push: { Activity: obj } }, { new: true, runValidators: true });
        if (editQuote) {
            return {
                success: true,
                message: 'Enquiry porforma invoice edited successfully.',
                data: editQuote
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding Quote: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * delete enquiry Porforma Invoice.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including enquiry Porforma Invoice details.
 */
exports.deletePI = async (enquiryId, auth) => {
    try {
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true, isPiCreated: true });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isSalesOrderCreated) {
            return {
                success: false,
                message: 'Enquiry sales order is already created.'
            };
        }
        const { email, _id, fname, lname } = auth;
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry porforma invoice(id: ${findEnquiry.proformaInvoice._id}) deleted by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const editQuote = await enquiryModel.findByIdAndUpdate(
            enquiryId,
            {
                proformaInvoice: null,
                $push: { Activity: obj },
                level: 2,
                isPiCreated: false,
                stageName: 'Create_PI'
            },
            { new: true, runValidators: true }
        );
        if (editQuote) {
            return {
                success: true,
                message: 'Enquiry porforma invoice deleted successfully.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during deleting porforma invoice: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Send Mail For Enquiry Porforma Invoice
 *
 * @param {object} updateData - Data of Enquiry Porforma Invoice.
 * @param {object} file - Data of uploaded sheet of Enquiry Porforma Invoice.
 * @returns {object} - An object with the results.
 */
exports.sendMailForEnquiryPI = async (updateData, file) => {
    try {
        const findenquiry = await query.findOne(enquiryModel, { _id: updateData.enquiryId, isActive: true, isDeleted: false, isQuoteCreated: true, isPiCreated: true });
        if (!findenquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }

        // if (findenquiry.isSalesOrderCreated) {
        //     return {
        //         success: false,
        //         message: 'Enquiry sales order is already created.'
        //     };
        // }
        const mailDetails = {
            enquiryId: updateData.enquiryId,
            porformaInvoceId: findenquiry.proformaInvoice._id,
            type: 'enquiryPorformaInvoice'
        };
        sendMailFun(
            updateData.to,
            updateData.cc,
            updateData.subject,
            updateData.body,
            file,
            mailDetails
        );
        return {
            success: true,
            message: `Enquiry porforma invoice mail sent.`,
            data: updateData.enquiryId
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while send Mail For Enquiry Porforma Invoice: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// ========================= Sales Order ============================= //


/**
 * Add enquiry Sales Order.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {object} auth - req auth.
 * @param {object} body - req body.
 * @returns {object} - An object with the results.
 */
exports.createSO = async (enquiryId, auth, body) => {
    try {
        const { email, _id, fname, lname } = auth;
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true, isPiCreated: true });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isSupplierPOCreated) {
            return {
                success: false,
                message: 'Enquiry supplier po already created.'
            };
        }

        body.createdBy = _id;
        body.updatedBy = _id;
        body.Id = generateId('SO');
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry sales order creation by ${fname} ${lname} from quote Id : ${body.quoteId} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const createSO = await enquiryModel.findByIdAndUpdate(enquiryId,
            {
                salesOrder: body,
                $push: { Activity: obj },
                level: 4,
                isSalesOrderCreated: true,
                stageName: 'Create_Supplier_PO'
            },
            { new: true, runValidators: true });
        if (createSO) {
            await leadModel.findByIdAndUpdate(
                findEnquiry.leadId,
                { isMovedToSalesOrder: true, level: CRMlevelEnum['SALESORDER'] },
                { runValidators: true }
            );
            return {
                success: true,
                message: 'Enquiry sales order created successfully.',
                data: createSO
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding sales order: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * get enquiry Sales Order by enquiry id.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} po - To fetch supplier po related details.
 * @returns {object} - An object with the results.
 */
exports.getSOById = async (enquiryId, po) => {
    try {
        const findPiData = await query.aggregation(enquiryModel, enquiryDao.getSOByIdPipeline(enquiryId, po));
        if (findPiData) {
            return {
                success: true,
                message: 'Enquiry sales order data.',
                data: findPiData[0]
            };
        }
        return {
            success: false,
            message: 'Enquiry sales order data not found.',
            data: {}
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during getting sales order by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets all enquiry sales order for dashboard of sales.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {object} queryObj - filters for getting all Enquiry.
 * @returns {object} - An object with the results, including all Enquiry.
 */
exports.getAllSalesOrder = async (orgId, queryObj) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { isActive, page = 1, perPage = 10, sortBy, sortOrder, search } = queryObj;
        let obj = {
            organisationId: orgId,
            isDeleted: false
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        const enquiryListCount = await query.find(enquiryModel, obj, { _id: 1 });
        const totalPages = Math.ceil(enquiryListCount.length / perPage);
        const enquiryData = await query.aggregation(enquiryModel, enquiryDao.getAllSalesOrderPipeline(orgId, { isActive, page: +page, perPage: +perPage, sortBy, sortOrder, search }));
        return {
            success: true,
            message: `Enquiry sales order fetched successfully.`,
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
        logger.error(LOG_ID, `Error fetching enquiry sales order for dashboard of sales: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * edit enquiry Sales Order.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {object} auth - req auth.
 * @param {object} body - req body.
 * @returns {object} - An object with the results, including enquiry Sales Order details.
 */
exports.updateSO = async (enquiryId, auth, body) => {
    try {
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true, isPiCreated: true, isSalesOrderCreated: true, level: 4 });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isSupplierPOCreated) {
            return {
                success: false,
                message: 'Enquiry supplier po is already created.'
            };
        }
        const { email, _id, fname, lname } = auth;
        body.updatedBy = _id;
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry sales order(id: ${findEnquiry.salesOrder._id}) edited by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const editQuote = await enquiryModel.findByIdAndUpdate(
            enquiryId,
            {
                salesOrder: body,
                $push: { Activity: obj }
            },
            { new: true, runValidators: true });
        if (editQuote) {
            return {
                success: true,
                message: 'Enquiry sales order edited successfully.',
                data: editQuote
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during editing sales order: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * delete enquiry sales order.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including enquiry sales order details.
 */
exports.deleteSO = async (enquiryId, auth) => {
    try {
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true, isPiCreated: true, isSalesOrderCreated: true, level: 4 });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        if (findEnquiry.isSupplierPOCreated) {
            return {
                success: false,
                message: 'Enquiry supplier po already created.'
            };
        }
        const { email, _id, fname, lname } = auth;
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry sales order(id: ${findEnquiry.salesOrder._id}) deleted by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const editQuote = await enquiryModel.findByIdAndUpdate(
            enquiryId,
            {
                salesOrder: null,
                $push: { Activity: obj },
                level: 3,
                isSalesOrderCreated: false,
                stageName: 'Create_Sales_Order'
            },
            { new: true, runValidators: true }
        );
        if (editQuote) {
            return {
                success: true,
                message: 'Enquiry sales order deleted successfully.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during deleting sales order: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// ========================= Supplier PO ============================= //

/**
 * Add enquiry Supplier PO.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {object} auth - req auth.
 * @param {object} body - req body.
 * @param {string} orgId - organisation id.
 * @returns {object} - An object with the results.
 */
exports.createSupplierPO = async (enquiryId, auth, body, orgId) => {
    try {
        const { email, _id, fname, lname } = auth;
        const findEnquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isItemShortListed: true, isQuoteCreated: true, isPiCreated: true, isSalesOrderCreated: true });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found'
            };
        }
        const enquirySupplierSelectedItemData = await query.find(enquirySupplierSelectedItemsModel, { enquiryId, isShortListed: true, isDeleted: false });
        const tempSupplierPOId = findEnquiry?.supplierPOId || [];
        const totalSuppliers = findEnquiry?.totalSuppliers || [...new Set(enquirySupplierSelectedItemData.map(e => e.supplierId.toString()))];

        if (totalSuppliers.length == tempSupplierPOId.length || totalSuppliers.length == tempSupplierPOId.length + 1) {
            return {
                success: false,
                message: 'The purchase order for the supplier in response to the enquiry has already been generated for all suppliers..'
            };
        }

        body.createdBy = _id;
        body.updatedBy = _id;
        body.Id = generateId('SPO');
        body.organisationId = orgId;
        body.enquiryId = enquiryId;
        body.leadId = findEnquiry.leadId;
        body.enquiryFinalItemId = enquirySupplierSelectedItemData.map(e => e._id);

        const createSupplierPO = await query.create(enquirySupplierPOModel, body);
        if (createSupplierPO) {
            const obj = {
                performedBy: _id,
                performedByEmail: email,
                actionName: `Enquiry supplier po creation by ${fname} ${lname} for supplier Id : ${body.supplierId} | supplier PO ID :- ${body.Id} | at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
            };
            const tempData = findEnquiry?.supplierPOId || [];
            await enquiryModel.findByIdAndUpdate(
                enquiryId,
                {
                    $push: { Activity: obj },
                    level: 5,
                    isSupplierPOCreated: true,
                    supplierPOId: [createSupplierPO._id, ...tempData]
                },
                { new: true, runValidators: true });
            return {
                success: true,
                message: 'Enquiry supplier po created successfully.',
                data: createSupplierPO
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding supplier po: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Function to send mail.
 *
 * @param {string} to - Send email to.
 * @param {string} cc - Send email cc.
 * @param {string} subject - Send email subject.
 * @param {string} body - email body.
 * @param {object} file - email attachment.
 * @param {object} mailDetailData - email extra details.
 * @returns {Promise<void>} - A Promise that resolves after operation.
 */
async function sendMailFun(to, cc, subject, body, file, mailDetailData) {
    try {
        // console.log('file:::::::::::', file);
        // const temp = file.location.split('/');
        const mailCred = {
            email: process.env.EMAIL1,
            password: process.env.PASS1,
            host: process.env.HOST,
            port: 465,
            secure: true
        };
        const mailDetails = {
            to,
            cc,
            subject,
            body,
            attachments: [{
                filename: file?.originalname,
                path: file.location
            }]
        };
        const nodemailerResponse = await sendMail(mailCred, mailDetails);
        await query.create(mailLogsModel, {
            to,
            from: mailCred.email,
            cc,
            subject,
            body,
            documents: [
                {
                    fileName: file?.originalname,
                    fileUrl: file.location
                }
            ],
            mailDetails: mailDetailData,
            nodemailerResponse
        });
    } catch (error) {
        logger.error(LOG_ID, `Error while sending mail TYPE:- (${mailDetailData.type}) : ${error}`);
    }
}