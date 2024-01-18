const moment = require('moment');
// Local Import
const { enquiryModel, leadModel, enquiryItemModel, enquirySupplierSelectedItemsModel, enquiryQuoteModel } = require('../dbModel');
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
        body.Id = `Q-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
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

        let quoteId = null;
        if (findQuote.isActive) {
            const findQuoteData = await enquiryQuoteModel.find({ isDeleted: false, isActive: false }).sort({ createdAt: -1 }).limit(1);
            quoteId = findQuoteData[0]._id;
            await enquiryQuoteModel.findByIdAndUpdate(quoteId, { isActive: true }, { new: true, runValidators: true });
        }
        const deleteQuote = await enquiryQuoteModel.findByIdAndUpdate(id, { isDeleted: false, isActive: false }, { new: true, runValidators: true });
        if (deleteQuote) {
            if (findQuote.isActive) {
                const obj = {
                    performedBy: _id,
                    performedByEmail: email,
                    actionName: `Enquiry quote deleted (id: ${id}) by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
                };
                let update = { $push: { Activity: obj }, level: 2, isQuoteCreated: true, stageName: 'View_Quote' };
                if (quoteId) update['quoteId'] = quoteId;
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

/**
 * edit enquiry Quote.
 *
 * @param {string} id - quote id.
 * @param {object} auth - req auth.
 * @param {object} body - req body.
 * @returns {object} - An object with the results, including enquiry details.
 */
exports.updateQuote = async (id, auth, body) => {
    try {
        const findEnquiry = await query.findOne(enquiryModel, { _id: body.enquiryId, isDeleted: false, isItemShortListed: true });
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
        const { email, _id, fname, lname } = auth;
        body.updatedBy = _id;
        const editQuote = await enquiryQuoteModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (editQuote) {
            const obj = {
                performedBy: _id,
                performedByEmail: email,
                actionName: `Enquiry quote(id: ${id}) edited by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
            };
            await enquiryModel.findByIdAndUpdate(
                body.enquiryId,
                { $push: { Activity: obj } },
                { new: true, runValidators: true }
            );
            return {
                success: true,
                message: 'Enquiry quote edited successfully.',
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
        body.Id = `PI-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
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

// /**
//  * Add enquiry Porforma Invoice.
//  *
//  * @param {string} id - PI id.
//  * @param {object} auth - req auth.
//  * @param {object} body - req body.
//  * @returns {object} - An object with the results.
//  */
// exports.editPI = async (id, auth, body) => {
//     try {
//         const { email, _id, fname, lname } = auth;
//         const findEnquiry = await query.findOne(enquiryModel, { 'proformaInvoice._id': id, isDeleted: false, isItemShortListed: true, isQuoteCreated: true, level: 3 });
//         if (!findEnquiry) {
//             return {
//                 success: false,
//                 message: 'Enquiry not found'
//             };
//         }
//         body.Id = `PI-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
//         const obj = {
//             performedBy: _id,
//             performedByEmail: email,
//             actionName: `Enquiry porforma invoice creation by ${fname} ${lname} from quote Id : ${body.quoteId} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
//         };
//         const createPI = await enquiryModel.findByIdAndUpdate(enquiryId,
//             { proformaInvoice: body, quoteId: body.quoteId, $push: { Activity: obj }, isPiCreated: true, stageName: 'Create_Sales_Order' },
//             { new: true, runValidators: true });
//         if (createPI) {
//             if (!findQuote.isActive) {
//                 await enquiryQuoteModel.updateMany({ _id: { $ne: body.quoteId } }, { $set: { isActive: false } });
//                 await enquiryQuoteModel.updateOne({ _id: body.quoteId }, { $set: { isActive: true } });
//             }
//             return {
//                 success: true,
//                 message: 'Enquiry porforma invoice created successfully.',
//                 data: createPI
//             };
//         }

//     } catch (error) {
//         logger.error(LOG_ID, `Error occurred during adding PI: ${error}`);
//         return {
//             success: false,
//             message: 'Something went wrong'
//         };
//     }
// };