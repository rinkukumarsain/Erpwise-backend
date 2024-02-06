const moment = require('moment');

// Local Import
const {
    enquiryModel,
    leadModel,
    enquiryItemModel,
    enquirySupplierSelectedItemsModel,
    enquiryQuoteModel,
    mailLogsModel,
    enquirySupplierPOModel,
    userModel,
    enquiryItemShippmentModel
} = require('../dbModel');
const { enquiryDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');
const { sendMail } = require('../utils/sendMail');
const { generateId } = require('../utils/generateId');
const { CRMlevelEnum, shipmentLevel } = require('../../config/default.json');

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
        obj[5] = await enquirySupplierPOModel.countDocuments({ isActive: true, isDeleted: false });
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
        const findUser = await query.findOne(userModel, { _id: enquiryData.salesPerson, isActive: true });
        if (!findUser) {
            return {
                success: false,
                message: 'Sales person not found.'
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
        enquiryData.salesPersonName = `${findUser.fname} ${findUser.lname}`;
        const newEnquiry = await query.create(enquiryModel, enquiryData);
        if (newEnquiry) {
            await leadModel.findByIdAndUpdate(
                enquiryData.leadId,
                { isMovedToEnquiry: true, level: CRMlevelEnum.ENQUIRY },
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
            level: level ? +level : 1,
            isDeleted: false
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        if (search) {
            obj['$or'] = [
                { Id: { $regex: `${search}.*`, $options: 'i' } },
                { companyName: { $regex: `${search}.*`, $options: 'i' } },
                { salesPersonName: { $regex: `${search}.*`, $options: 'i' } },
                { contactPerson: { $regex: `${search}.*`, $options: 'i' } }
            ];
        }
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

/**
 * Add enquiry reminder.
 *
 * @param {string} enquiryId - Id of enquiry (req.params).
 * @param {object} body - req.body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including the enquiry data.
 */
exports.addReminder = async (enquiryId, body, auth) => {
    try {
        const { _id, email, fname, lname } = auth;
        const findenquiry = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false });
        if (!findenquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }
        body.createdBy = _id;
        body.createdByName = `${fname} ${lname}`;
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry reminder added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.`
        };

        const updatedenquiry = await enquiryModel.findByIdAndUpdate(
            enquiryId,
            { $push: { reminders: body, Activity: obj } },
            { new: true, runValidators: true }
        );

        if (updatedenquiry) {
            return {
                success: true,
                message: 'Enquiry reminder added successfully.',
                data: updatedenquiry
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding reminder to enquiry: ${error}`);
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
        if (Array.isArray(body.AgentCommission) && body.AgentCommission.length > 0) {
            body.agentTotalCommission = 0;
            body.agentTotalCommissionValue = 0;
            let uniqueAgentIds = new Set();

            for (let ele of body.AgentCommission) {
                ele.commission = Number(ele.commission);
                ele.commissionValue = Number(ele.commissionValue);
                if (body.agentTotalCommission > 50) {
                    return {
                        success: false,
                        message: `Total commission can't be more than 50%.`
                    };
                }
                if (uniqueAgentIds.has(ele.agentId)) {
                    return {
                        success: false,
                        message: 'You cannot add the same agent multiple times.'
                    };
                }

                uniqueAgentIds.add(ele.agentId);

                body.agentTotalCommission += ele.commission;
                body.agentTotalCommissionValue += ele.commissionValue;
                ele.enquiryId = body.enquiryId;
            }
        }

        // body.AgentCommission = body.agent
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
            isDeleted: false,
            level: 2,
            isQuoteCreated: true
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        if (search) {
            obj['$or'] = [
                // { Id: { $regex: `${search}.*`, $options: 'i' } },
                { companyName: { $regex: `${search}.*`, $options: 'i' } },
                { contactPerson: { $regex: `${search}.*`, $options: 'i' } }
                // { contact_person: { $regex: `${search}.*`, $options: 'i' } },
                // { quoteDueDate: { $regex: `${search}.*`, $options: 'i' } },
                // { final_quote: { $regex: `${search}.*`, $options: 'i' } }
            ];
        }
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

/**
 * Add enquiryQuote reminder.
 *
 * @param {string} enquiryQuoteId - Id of enquiryQuote (req.params).
 * @param {object} body - req.body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including the enquiryQuote data.
 */
exports.addQuoteReminder = async (enquiryQuoteId, body, auth) => {
    try {
        const { _id, email, fname, lname } = auth;
        const findenquiryQuote = await query.findOne(enquiryQuoteModel, { _id: enquiryQuoteId, isDeleted: false });
        if (!findenquiryQuote) {
            return {
                success: false,
                message: 'Enquiry quote not found.'
            };
        }
        body.createdBy = _id;
        body.createdByName = `${fname} ${lname}`;
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry quote reminder added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.`
        };

        const updatedenquiryQuote = await enquiryQuoteModel.findByIdAndUpdate(
            enquiryQuoteId,
            { $push: { reminders: body, Activity: obj } },
            { new: true, runValidators: true }
        );

        if (updatedenquiryQuote) {
            return {
                success: true,
                message: 'Enquiry quote reminder added successfully.',
                data: updatedenquiryQuote
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding reminder to enquiryQuote: ${error}`);
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
            level: 3,
            isPiCreated: true,
            isDeleted: false
        };
        if (search) {
            obj['$or'] = [
                { 'proformaInvoice.Id': { $regex: `${search}.*`, $options: 'i' } },
                { companyName: { $regex: `${search}.*`, $options: 'i' } },
                { contactPerson: { $regex: `${search}.*`, $options: 'i' } }
            ];
        }
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

/**
 * Add enquiryPI reminder.
 *
 * @param {string} enquiryId - Id of enquiryPI (req.params).
 * @param {object} body - req.body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including the enquiryPI data.
 */
exports.addPIReminder = async (enquiryId, body, auth) => {
    try {
        const { _id, email, fname, lname } = auth;
        const findenquiryPI = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isPiCreated: true });
        if (!findenquiryPI) {
            return {
                success: false,
                message: 'Enquiry PI not found.'
            };
        }
        body.createdBy = _id;
        body.createdByName = `${fname} ${lname}`;
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry PI reminder added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.`
        };

        const updatedenquiryPI = await enquiryModel.findByIdAndUpdate(
            enquiryId,
            { $push: { Activity: obj, 'proformaInvoice.reminders': body } },
            { new: true, runValidators: true }
        );

        if (updatedenquiryPI) {
            return {
                success: true,
                message: 'Enquiry PI reminder added successfully.',
                data: updatedenquiryPI
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding reminder to enquiry PI: ${error}`);
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
            level: 4,
            isQuoteCreated: true,
            isDeleted: false
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        if (search) {
            obj['$or'] = [
                { 'salesOrder.Id': { $regex: `${search}.*`, $options: 'i' } },
                { 'proformaInvoice.Id': { $regex: `${search}.*`, $options: 'i' } },
                { companyName: { $regex: `${search}.*`, $options: 'i' } },
                { contactPerson: { $regex: `${search}.*`, $options: 'i' } }
            ];
        }
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

/**
 * Add enquirySO reminder.
 *
 * @param {string} enquiryId - Id of enquirySO (req.params).
 * @param {object} body - req.body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including the enquirySO data.
 */
exports.addSOReminder = async (enquiryId, body, auth) => {
    try {
        const { _id, email, fname, lname } = auth;
        const findenquirySO = await query.findOne(enquiryModel, { _id: enquiryId, isDeleted: false, isPiCreated: true, isSalesOrderCreated: true });
        if (!findenquirySO) {
            return {
                success: false,
                message: 'Enquiry SO not found.'
            };
        }
        body.createdBy = _id;
        body.createdByName = `${fname} ${lname}`;
        const obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry SO reminder added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.`
        };

        const updatedenquirySO = await enquiryModel.findByIdAndUpdate(
            enquiryId,
            { $push: { Activity: obj, 'salesOrder.reminders': body } },
            { new: true, runValidators: true }
        );

        if (updatedenquirySO) {
            return {
                success: true,
                message: 'Enquiry SO reminder added successfully.',
                data: updatedenquirySO
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during adding reminder to enquiry SO: ${error}`);
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

        if (totalSuppliers.length == tempSupplierPOId.length) {
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
        body.enquiryFinalItemId = enquirySupplierSelectedItemData.filter(e => {
            if (e.supplierId == body.supplierId) return e._id;
        });

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
                    stageName: 'Create_Order_Tracking',
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
 * get Supplier PO by enquiry.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} orgId - organisation id.
 * @returns {object} - An object with the results.
 */
exports.getAllSupplierPoOfEnquiry = async (enquiryId, orgId) => {
    try {
        // console.log('::::::::', JSON.stringify(enquiryDao.getAllSupplierPoOfEnquiryPipeline(enquiryId, orgId)));
        const findData = await query.aggregation(enquiryModel, enquiryDao.getAllSupplierPoOfEnquiryPipeline(enquiryId, orgId));
        if (findData.length == 1) {
            return {
                success: true,
                message: 'Enquiry supplier po fetched successfully.',
                data: findData[0]
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during getting all supplier po of an enquiry: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets all enquiry supplier po for dashboard of sales.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {object} queryObj - filters for getting all Enquiry.
 * @returns {object} - An object with the results, including all Enquiry supplier po.
 */
exports.getAllSupplierPO = async (orgId, queryObj) => {
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
            level: 5,
            isSupplierPOCreated: true,
            isDeleted: false
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        if (search) {
            obj['$or'] = [
                { companyName: { $regex: `${search}.*`, $options: 'i' } },
                { contactPerson: { $regex: `${search}.*`, $options: 'i' } },
                { 'supplierPOId': { $regex: `${search}.*`, $options: 'i' } },
                { 'salesOrderId': { $regex: `${search}.*`, $options: 'i' } },
                { suppliersCompanyName: { $regex: `${search}.*`, $options: 'i' } },
                { warehouseName: { $regex: `${search}.*`, $options: 'i' } }
            ];
        }
        const enquiryListCount = await query.find(enquiryModel, obj, { _id: 1 });
        const totalPages = Math.ceil(enquiryListCount.length / perPage);
        const enquiryData = await query.aggregation(enquiryModel, enquiryDao.getAllSupplierPoForDashboardPipeline(orgId, { isActive, page: +page, perPage: +perPage, sortBy, sortOrder, search }));
        return {
            success: true,
            message: `Enquiry supplier po fetched successfully.`,
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
        logger.error(LOG_ID, `Error fetching enquiry supplier po for dashboard of sales: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit enquiry Supplier PO.
 *
 * @param {string} supplierPOId - enquiry supplier po id.
 * @param {object} auth - req auth.
 * @param {object} body - req body.
 * @param {string} orgId - organisation id.
 * @returns {object} - An object with the results.
 */
exports.editSupplierPO = async (supplierPOId, auth, body, orgId) => {
    try {
        const { email, _id, fname, lname } = auth;
        const findEnquirySupplierPO = await query.findOne(enquirySupplierPOModel, { _id: supplierPOId, organisationId: orgId, isDeleted: false, isActive: true });
        if (!findEnquirySupplierPO) {
            return {
                success: false,
                message: 'Enquiry supplier po not found'
            };
        }

        body.updatedBy = _id;


        const updateSupplierPO = await enquirySupplierPOModel.findByIdAndUpdate(supplierPOId, body, { new: true, runValidators: true });
        if (updateSupplierPO) {
            const obj = {
                performedBy: _id,
                performedByEmail: email,
                actionName: `Enquiry supplier po edited by ${fname} ${lname} for supplier po Id : ${supplierPOId} | at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
            };
            await enquiryModel.findByIdAndUpdate(findEnquirySupplierPO.enquiryId, { $push: { Activity: obj } }, { runValidators: true });
            return {
                success: true,
                message: 'Enquiry supplier po edited successfully.',
                data: updateSupplierPO
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred during editing supplier po by id(${supplierPOId}): ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Send Mail For Enquiry Supplier PO
 *
 * @param {object} updateData - Data of Enquiry Supplier PO.
 * @param {object} file - Data of uploaded sheet of Enquiry Supplier PO.
 * @returns {object} - An object with the results.
 */
exports.sendMailForEnquirySupplierPO = async (updateData, file) => {
    try {
        const findenquiry = await query.findOne(enquiryModel,
            {
                _id: updateData.enquiryId,
                isActive: true, isDeleted: false,
                isQuoteCreated: true,
                isPiCreated: true,
                isSalesOrderCreated: true,
                isSupplierPOCreated: true
            });
        if (!findenquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }
        const findEnquirySupplierPO = await query.findOne(enquirySupplierPOModel, { _id: updateData.supplierPOId, isDeleted: false, isActive: true });
        if (!findEnquirySupplierPO) {
            return {
                success: false,
                message: 'Enquiry supplier po not found'
            };
        }
        const mailDetails = {
            enquiryId: updateData.enquiryId,
            supplierPOId: updateData.supplierPOId,
            type: 'enquirySupplierPO'
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
            message: `Enquiry supplier po mail sent.`,
            data: updateData.enquiryId
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while send Mail For Enquiry supplier po: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// ========================= Order Tracking ============================= //

/**
 * Create shippment from enquiry Supplier PO.
 *
 * @param {object} body - req body.
 * @param {string} orgId - organisation id.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results.
 */
exports.createShipment = async (body, orgId, auth) => {
    try {
        const { _id } = auth;
        const findenquiry = await query.findOne(enquiryModel,
            {
                _id: body.enquiryId,
                isActive: true, isDeleted: false,
                isQuoteCreated: true,
                isPiCreated: true,
                isSalesOrderCreated: true,
                isSupplierPOCreated: true
            });
        if (!findenquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }
        const findEnquirySupplierPO = await query.findOne(enquirySupplierPOModel, { _id: body.supplierPoId, isDeleted: false, isActive: true });
        if (!findEnquirySupplierPO) {
            return {
                success: false,
                message: 'Enquiry supplier po not found'
            };
        }
        // const findEnquirySupplierSelectedItem = await query.findOne(enquirySupplierSelectedItemsModel, { _id: body.enquiryFinalItemId, isShortListed: true, isDeleted: false });
        // if (!findEnquirySupplierSelectedItem) {
        //     return {
        //         success: false,
        //         message: 'Enquiry supplier shortlisted item not found.'
        //     };
        // }
        const findEnquiryItemShippmentModel = await query.find(enquiryItemShippmentModel, {
            enquiryId: body.enquiryId,
            supplierPoId: body.supplierPoId,
            supplierId: body.supplierId,
            enquiryFinalItemId: body.enquiryFinalItemId
        });
        let totalQuantityOrdered = +body.shipQuantity;
        console.log(findEnquiryItemShippmentModel.length);
        if (findEnquiryItemShippmentModel.length > 0) {
            for (let ele of findEnquiryItemShippmentModel) totalQuantityOrdered += ele.shipQuantity;
            if (totalQuantityOrdered > +body.quantity) {
                return {
                    success: false,
                    message: `You have already created ${findEnquiryItemShippmentModel.length} shippment and the total of their quantity is ${totalQuantityOrdered - +body.shipQuantity}.`
                };
            }
        }
        body.Id = generateId('SHIP');
        body.organisationId = orgId;
        body.createdBy = _id;
        body.updatedBy = _id;

        const saveShippment = await query.create(enquiryItemShippmentModel, body);
        if (saveShippment) {
            return {
                success: true,
                message: 'Shippment created successfully.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error while creating shippment from Enquiry supplier po: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * get enquiry with all its spupplier,supplier po
 * and if shipments is created then the data of shipment
 * by enquiryId.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} orgId - organisation id.
 * @returns {object} - An object with the results.
 */
exports.getAllSupplierWithItemsAndPoWithShipments = async (enquiryId, orgId) => {
    try {
        const findData = await query.aggregation(enquiryModel, enquiryDao.getAllSupplierWithItemsAndPoWithShipmentsPipeline(enquiryId, orgId));
        if (findData.length > 0) {
            return {
                success: true,
                message: 'Enquiry shipments fetched successfully.',
                data: findData
            };
        }
        return {
            success: false,
            message: 'Enquiry shipments not found.',
            data: []
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during get All Supplier With Items And Po With Shipments: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit enquiry item shipment by id.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} shipmentId - shipment id.
 * @param {string} orgId - organisation id.
 * @param {object} updateData - req body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results.
 */
exports.editShipment = async (enquiryId, shipmentId, orgId, updateData, auth) => {
    try {
        const findShipment = await query.findOne(enquiryItemShippmentModel, { _id: shipmentId, enquiryId, organisationId: orgId, isDeleted: false, isActive: true });
        if (!findShipment) {
            return {
                success: false,
                message: 'Enquiry shipment not found.'
            };
        }
        if (findShipment.level > 0) {
            return {
                success: false,
                message: `The order tracking has already begun therefore, you cannot edit the shipment now.`
            };
        }
        updateData.updatedBy = auth._id;
        const updateShipment = await enquiryItemShippmentModel.findByIdAndUpdate(shipmentId, updateData, { new: true, runValidators: true });
        if (updateShipment) {
            return {
                success: true,
                message: `Shipment(${findShipment.Id}) updated successfully.`,
                data: updateShipment
            };
        }
        return {
            success: false,
            message: `Error while updating shipment(${findShipment.Id}).`,
            data: {}
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while editing shippment from Enquiry supplier po: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Delete enquiry item shipment by id.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} shipmentId - shipment id.
 * @param {string} orgId - organisation id.
 * @returns {object} - An object with the results.
 */
exports.deleteShipment = async (enquiryId, shipmentId, orgId) => {
    try {
        const findShipment = await query.findOne(enquiryItemShippmentModel, { _id: shipmentId, enquiryId, organisationId: orgId, isDeleted: false, isActive: true });
        if (!findShipment) {
            return {
                success: false,
                message: 'Enquiry shipment not found.'
            };
        }
        if (findShipment.level > 0) {
            return {
                success: false,
                message: `The order tracking has already begun therefore, you cannot delete the shipment now.`
            };
        }
        const deleteShipment = await enquiryItemShippmentModel.findByIdAndUpdate(shipmentId, { isDeleted: true }, { new: true, runValidators: true });
        if (deleteShipment) {
            return {
                success: true,
                message: `Shipment(${findShipment.Id}) deleted successfully.`
            };
        }
        return {
            success: false,
            message: `Error while deleting shipment(${findShipment.Id}).`
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while deleting shippment from Enquiry supplier po: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit enquiry item shipment by id update status to Ready For Dispatch.
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} shipmentId - shipment id.
 * @param {string} orgId - organisation id.
 * @param {object} body - req body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results.
 */
exports.shipmentReadyForDispatch = async (enquiryId, shipmentId, orgId, body, auth) => {
    try {
        const { _id, fname, lname, role } = auth;
        const findShipment = await query.findOne(enquiryItemShippmentModel, { _id: shipmentId, enquiryId, organisationId: orgId, isDeleted: false, isActive: true });
        if (!findShipment) {
            return {
                success: false,
                message: 'Enquiry shipment not found.'
            };
        }
        if (findShipment.level >= 1) {
            const text = shipmentLevel[findShipment.level]?.split('_').join(' ');
            return {
                success: false,
                message: `The order tracking has already begun, the current status is '${text}'`
            };
        }
        body.createdBy = _id;
        body.updatedBy = _id;
        body.createdByName = `${fname} ${lname}`;
        body.createdByRole = role;
        const update = await enquiryItemShippmentModel.findByIdAndUpdate(shipmentId, { readyForDispatch: body, level: 1, stageName: 'Shipment_Dispatched' }, { new: true, runValidators: true });
        if (update) {
            return {
                success: true,
                message: `Shipment(${findShipment.Id}) is ready to dispatch now.`
            };
        }
        return {
            success: false,
            message: `Error while updating shipment(${findShipment.Id}) status to ready for dispatch.`
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while editing enquiry item shipment by id update status to Ready For Dispatch: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit enquiry item shipment by id update status to Shipment Dispatched
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} shipmentId - shipment id.
 * @param {string} orgId - organisation id.
 * @param {object} body - req body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results.
 */
exports.shipmentShipmentDispatched = async (enquiryId, shipmentId, orgId, body, auth) => {
    try {
        const { _id, fname, lname, role } = auth;
        const findShipment = await query.findOne(enquiryItemShippmentModel, { _id: shipmentId, enquiryId, organisationId: orgId, isDeleted: false, isActive: true });
        if (!findShipment) {
            return {
                success: false,
                message: 'Enquiry shipment not found.'
            };
        }
        if (findShipment.level >= 2) {
            const text = shipmentLevel[findShipment.level]?.split('_').join(' ');
            return {
                success: false,
                message: `The order tracking has already begun, the current status is '${text}'`
            };
        }
        if (!findShipment.readyForDispatch) {
            return {
                success: false,
                message: 'First please update the shipment status to ready to dispatch.'
            };
        }
        body.createdBy = _id;
        body.updatedBy = _id;
        body.createdByName = `${fname} ${lname}`;
        body.createdByRole = role;
        const update = await enquiryItemShippmentModel.findByIdAndUpdate(shipmentId, { shipmentDispatched: body, level: findShipment.shipTo == 'warehouse' ? 2 : 3, stageName: findShipment.shipTo == 'warehouse' ? 'Warehouse_Goods_Out_(GO)' : 'Shipment_Delivered' }, { new: true, runValidators: true });
        if (update) {
            return {
                success: true,
                message: `Shipment(${findShipment.Id}) is dispatched successfully.`
            };
        }
        return {
            success: false,
            message: `Error while updating shipment(${findShipment.Id}) status to shipment dispatch.`
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while editing enquiry item shipment by id update status to shipment dispatch: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit enquiry item shipment by id update status to warehouse Goods Out
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} shipmentId - shipment id.
 * @param {string} orgId - organisation id.
 * @param {object} body - req body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results.
 */
exports.shipmentWarehouseGoodsOut = async (enquiryId, shipmentId, orgId, body, auth) => {
    try {
        const { _id, fname, lname, role } = auth;
        const findShipment = await query.findOne(enquiryItemShippmentModel, { _id: shipmentId, enquiryId, organisationId: orgId, isDeleted: false, isActive: true });
        if (!findShipment) {
            return {
                success: false,
                message: 'Enquiry shipment not found.'
            };
        }
        if (findShipment.level >= 3) {
            const text = shipmentLevel[findShipment.level]?.split('_').join(' ');
            return {
                success: false,
                message: `The order tracking has already begun, the current status is '${text}'`
            };
        }
        if (!findShipment.shipmentDispatched) {
            return {
                success: false,
                message: 'First please update the shipment status to shipment dispatched.'
            };
        }
        body.createdBy = _id;
        body.updatedBy = _id;
        body.createdByName = `${fname} ${lname}`;
        body.createdByRole = role;
        const update = await enquiryItemShippmentModel.findByIdAndUpdate(shipmentId, { warehouseGoodsOut: body, level: 3, stageName: 'Shipment_Delivered' }, { new: true, runValidators: true });
        if (update) {
            return {
                success: true,
                message: `Warehouse Goods Out for Shipment(${findShipment.Id}) successfully.`
            };
        }
        return {
            success: false,
            message: `Error while updating shipment(${findShipment.Id}) status to Warehouse Goods Out.`
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while editing enquiry item shipment by id update status to Warehouse Goods Out: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Edit enquiry item shipment by id update status to shipment delivered
 *
 * @param {string} enquiryId - enquiry id.
 * @param {string} shipmentId - shipment id.
 * @param {string} orgId - organisation id.
 * @param {object} body - req body.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results.
 */
exports.shipmentShipmentDelivered = async (enquiryId, shipmentId, orgId, body, auth) => {
    try {
        const { _id, fname, lname, role } = auth;
        const findShipment = await query.findOne(enquiryItemShippmentModel, { _id: shipmentId, enquiryId, organisationId: orgId, isDeleted: false, isActive: true });
        if (!findShipment) {
            return {
                success: false,
                message: 'Enquiry shipment not found.'
            };
        }
        if (findShipment.level >= 4) {
            const text = shipmentLevel[findShipment.level]?.split('_').join(' ');
            return {
                success: false,
                message: `The order tracking has already begun, the current status is '${text}'`
            };
        }
        if ((findShipment.shipTo == 'warehouse' && !findShipment.warehouseGoodsOut) || (findShipment.shipTo == 'customer' && !findShipment.shipmentDispatched)) {
            return {
                success: false,
                message: `First please update the shipment status to ${findShipment.shipTo == 'warehouse' ? 'warehouse goods Out' : 'shipment dispatched'}.`
            };
        }
        body.createdBy = _id;
        body.updatedBy = _id;
        body.createdByName = `${fname} ${lname}`;
        body.createdByRole = role;
        const update = await enquiryItemShippmentModel.findByIdAndUpdate(shipmentId, { shipmentDelivered: body, level: 4, stageName: 'Create_Supplier_Bill' }, { new: true, runValidators: true });
        if (update) {
            return {
                success: true,
                message: `shipment delivered for Shipment(${findShipment.Id}) successfully.`
            };
        }
        return {
            success: false,
            message: `Error while updating shipment(${findShipment.Id}) status to shipment dselivered.`
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while editing enquiry item shipment by id update status to shipment dselivered: ${error}`);
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