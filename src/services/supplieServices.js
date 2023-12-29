const moment = require('moment');
// Local Import
const { supplierModel, supplierItemsModel } = require('../dbModel');
const { supplierLevelEnum, supplierValueByKey, supplierPipelineLevel } = require('../../config/default.json');
const { supplierDao } = require('../dao');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/supplierService';

/**
 * Creates a new supplier.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} supplierData - Data for creating a new supplier.
 * @param {string} orgId - Id of logedin user organisation.
 * @param {string} type - req.query.
 * @returns {object} - An object with the results, including the new supplier.
 */
exports.createSupplier = async (auth, supplierData, orgId, type) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const findUniqueCompanyName = await query.findOne(supplierModel, { organisationId: orgId, companyName: supplierData.companyName });
        if (findUniqueCompanyName) {
            return {
                success: false,
                message: 'Company name already exist.'
            };
        }
        const { email, _id, fname, lname } = auth;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `${(type && type == 'yes') ? 'Approved ' : ''}Supplier creation by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        supplierData.Activity = [obj];
        supplierData.createdBy = _id;
        supplierData.updatedBy = _id;
        supplierData.organisationId = orgId;
        supplierData.level = (type && type == 'yes') ? supplierLevelEnum.APPROVEDSUPPLIERS : supplierLevelEnum.PROSPECT;
        supplierData.Id = `SI-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
        const newSupplier = await query.create(supplierModel, supplierData);
        return {
            success: true,
            message: `${(type && type == 'yes') ? 'Approved ' : ''}Supplier created successfully.`,
            data: newSupplier
        };
    } catch (error) {
        logger.error(LOG_ID, `Error creating supplier: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets all Supplier.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {object} queryObj - filters for getting all suppliers.
 * @returns {object} - An object with the results, including all suppliers.
 */
exports.getAllSupplier = async (orgId, queryObj) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { isActive, page = 1, perPage = 10, sortBy, sortOrder, level, id } = queryObj;
        if (level) {
            if (!supplierValueByKey[level]) {
                return {
                    success: false,
                    message: 'Please provied a vaild supplier level.'
                };
            }
        }
        let obj = {
            organisationId: orgId,
            level: level ? +level : 1,
            isDeleted: false
        };
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        if (id) obj['_id'] = id;
        const supplierListCount = await query.find(supplierModel, obj, { _id: 1 });
        const totalPages = Math.ceil(supplierListCount.length / perPage);
        const supplierData = await query.aggregation(supplierModel, supplierDao.getAllSupplierPipeline(orgId, { isActive, page: +page, perPage: +perPage, sortBy, sortOrder, level, supplierId: id }));
        const messageName = supplierValueByKey[level ? level : '1'];
        const formattedString = messageName.charAt(0).toUpperCase() + messageName.slice(1).toLowerCase();
        return {
            success: true,
            message: `${formattedString} fetched successfully.`,
            data: {
                supplierData,
                pagination: {
                    page,
                    perPage,
                    totalChildrenCount: supplierListCount.length,
                    totalPages
                }
            }
        };
    } catch (error) {
        logger.error(LOG_ID, `Error fetching lead: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Gets Supplier By Id.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @param {string} supplierId - Id of supplier.
 * @returns {object} - An object with the results, including supplier.
 */
exports.getSupplierById = async (orgId, supplierId) => {
    try {
        const supplierData = await query.aggregation(supplierModel, supplierDao.getSupplierByIdPipeline(orgId, supplierId));
        if (!supplierData) {
            return {
                success: false,
                message: 'No supplier found!'
            };
        }
        return {
            success: true,
            message: 'Supplier data fetched successfully.',
            data: supplierData
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting supplier by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Updates a Supplier by ID.
 *
 * @param {string} auth -The is contain is auth user .
 * @param {string} supplierId - The ID of the Supplier to be updated.
 * @param {object} updatedData - Updated data for the Supplier.
 * @param {object} orgId - contain organisation id .
 * @returns {object} - An object with the results, including the updated Supplier.
 */
exports.updateSupplierById = async (auth, supplierId, updatedData, orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const data = await query.findOne(supplierModel, { _id: supplierId });
        if (!data) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        if (updatedData.companyName) {
            const findUniqueCompanyName = await query.findOne(supplierModel, { organisationId: orgId, companyName: updatedData.companyName, _id: { $ne: supplierId } });
            if (findUniqueCompanyName) {
                return {
                    success: false,
                    message: 'Company name already exist.'
                };
            }
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier updated by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        updatedData['$push'] = { Activity: obj };
        const updatedSupplier = await supplierModel.findByIdAndUpdate(
            supplierId,
            updatedData,
            { new: true, runValidators: true }
        );

        return {
            success: true,
            message: 'Supplier updated successfully.',
            data: updatedSupplier
        };
    } catch (error) {
        logger.error(LOG_ID, `Error updating Supplier: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * activate or deactivated a Supplier by ID.
 *
 * @param {string} supplierId - The ID of the Supplier to be deleted.
 * @param {object} auth -The is contain is auth user .
 * @param {boolean} isApproved - identifier to activate or deactivated supplier.
 * @returns {object} - An object with the results, including the deleted Lead.
 */
exports.activateDeactivateSupplier = async (supplierId, auth, isApproved) => {
    try {
        const data = await query.findOne(supplierModel, { _id: supplierId });
        if (!data) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        let updatedData = { isApproved };
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier ${isApproved ? 'activated' : 'deactivated'} by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        updatedData['$push'] = { Activity: obj };
        const updateSupplier = await supplierModel.findByIdAndUpdate(
            supplierId,
            updatedData,
            { new: true, runValidators: true }
        );
        if (updateSupplier) {
            return {
                success: true,
                message: `Supplier ${isApproved ? 'activated' : 'deactivated'} successfully.`,
                data: updateSupplier
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error  ${isApproved ? 'activated' : 'deactivated'} supplier: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};


/**
 * (Not useing for now)
 * Creates a new Supplier Approved Supplier.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} body - Data for creating a new Approved Supplier.
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the new Approved Supplier.
 */
exports.createApprovedSupplier = async (auth, body, orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        // const {} = body
        const findUniqueCompanyName = await query.findOne(supplierModel, { organisationId: orgId, companyName: body.companyName });
        if (findUniqueCompanyName) {
            return {
                success: false,
                message: 'Company name already exist.'
            };
        }
        const { email, _id, fname, lname } = auth;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Approved Supplier creation by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        body.Activity = [obj];
        body.createdBy = _id;
        body.organisationId = orgId;
        body.level = supplierLevelEnum.APPROVEDSUPPLIERS;
        // body.pipelineStage = supplierValueByKey[supplierLevelEnum.APPROVEDSUPPLIERS];
        body.Id = `SI-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
        const newLead = await query.create(supplierModel, body);
        // if(newLead){

        // }
        return {
            success: true,
            message: 'Approved supplier created successfully.',
            data: newLead
        };
    } catch (error) {
        logger.error(LOG_ID, `Error creating lead: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Create/Updating supplier finance.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} financeData - Data for adding a supplier finance.
 * @param {string} supplierId - Id of supplier.
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the new supplier data.
 */
exports.addSupplierFinance = async (auth, financeData, supplierId, orgId) => {
    try {
        const findSupplier = await query.findOne(supplierModel, { _id: supplierId, organisationId: orgId });
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found.'
            };
        }
        const { fname, email, _id, lname } = auth;
        if (findSupplier.isFinanceAdded) {
            financeData.createdBy = findSupplier.financeMeta.createdBy || _id;
            financeData.updatedBy = _id;

        } else financeData.createdBy = _id;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: findSupplier.isFinanceAdded ? `Supplier finance updated by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.` : `Supplier finance added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.`
        };
        let updatedData = { isFinanceAdded: true, financeMeta: financeData, updatedBy: _id };
        updatedData['$push'] = { Activity: obj };
        const updatedSupplierFinance = await supplierModel.findByIdAndUpdate(
            supplierId,
            updatedData,
            { new: true, runValidators: true }
        );

        if (updatedSupplierFinance) {
            return {
                success: true,
                message: findSupplier.isFinanceAdded ? 'Supplier finance updated successfully.' : 'Supplier finance added successfully.',
                data: updatedSupplierFinance
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error adding Supplier finance: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Upload supplier Document.
 *
 * @param {string} supplierId - The ID of the supplier.
 * @param {object} file - Parameters containing 'file details'.
 * @param {string} file.location - Parameters containing 'file location'.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including supplier details.
 */
exports.uploadSupplierDocument = async (supplierId, { location }, auth) => {
    try {
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier document uploaded by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const findAndUpdateLeadDocument = await supplierModel.findOneAndUpdate({ _id: supplierId }, { $push: { documents: location, Activity: obj }, updatedBy: auth._id }, { new: true });

        if (!findAndUpdateLeadDocument) {
            return {
                success: false,
                message: 'Error while uploading supplier document.'
            };
        }

        return {
            success: true,
            message: `Supplier document uploaded successfully.`,
            data: findAndUpdateLeadDocument
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching uploading Supplier document (uploadSupplierDocument): ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * delete Supplier Document.
 *
 * @param {string} supplierId - The ID of the supplier.
 * @param {string} imageUrl - Parameters containing 'file url'.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including supplier details.
 */
exports.deleteSupplierDocument = async (supplierId, imageUrl, auth) => {
    try {
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Supplier document deleted by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        const updateDocument = await supplierModel.findOneAndUpdate({ _id: supplierId }, { $pull: { documents: imageUrl }, $push: { Activity: obj } }, { new: true });

        if (!updateDocument) {
            return {
                success: false,
                message: 'Error while deleting supplier document.'
            };
        }

        return {
            success: true,
            message: `Supplier document deleted successfully.`,
            data: updateDocument
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching deleting supplier document (deleteSupplierDocument): ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Get supplier dashboard count.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the supplier dashboard count.
 */
exports.getSupplierDashBoardCount = async (orgId) => {
    try {
        let obj = {
            'PROSPECT': 0,
            'PIPELINE': 0,
            'APPROVEDSUPPLIERS': 0
        };
        const find = await query.aggregation(supplierModel, supplierDao.getSupplierDashBoardCount(orgId));
        if (!find.length) {
            return {
                success: true,
                message: 'Supplier dashboard count.',
                data: {
                    'PROSPECT': 0,
                    'PIPELINE': 0,
                    'APPROVEDSUPPLIERS': 0
                }
            };
        }
        for (let ele of find) obj[supplierValueByKey[ele._id]] = ele.count;

        if (find.length) {
            return {
                success: true,
                message: 'Supplier dashboard count.',
                data: obj
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching supplier dashbord count: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Get Supplier pipeline data.
 *
 * @param {string} orgId - Id of logedin user organisation.
 * @returns {object} - An object with the results, including the Supplier pipeline data.
 */
exports.getPipelineData = async (orgId) => {
    try {
        const find = await query.aggregation(supplierModel, supplierDao.getPipelineData(orgId));
        if (find.length == 0) {
            return {
                success: true,
                message: 'Supplier pipeline not found.',
                data: []
            };
        }
        return {
            success: true,
            message: 'Supplier pipeline data.',
            data: find
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching supplier pipeline data: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Move Supplier to pipeline.
 *
 * @param {object} auth - req auth.
 * @param {string} supplierId - Id of supplier.
 * @param {object} updateData - data of supplier.
 * @returns {object} - An object with the results, including the Supplier pipeline data.
 */
exports.moveToPipeLine = async (auth, supplierId, updateData) => {
    try {
        if (!supplierPipelineLevel[updateData.pipelineStage]) {
            return {
                success: false,
                message: 'Supplier pipeline stage not found.'
            };
        }
        const findSupplier = await query.findOne(supplierModel, { _id: supplierId });
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found!'
            };
        }
        const { _id, email, fname, lname } = auth;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: findSupplier.level == 2 ? `Supplier pipeline stage changed (${updateData.pipelineStage.split('_').join(' ')}) by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.` : `Supplier moved to pipeline (Contact Made) added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.`
        };
        if (findSupplier.level == 1) updateData.level = 2;
        updateData['$push'] = { Activity: obj };
        const updateSupplier = await supplierModel.findOneAndUpdate({ _id: supplierId }, updateData, { new: true, runValidators: true });
        if (updateSupplier) {
            return {
                success: true,
                message: `Supplier ${findSupplier.level == 1 ? 'moved to pipeline (Contact Made)' : `pipeline stage changed (${updateData.pipelineStage.split('_').join(' ')})`}`,
                data: updateSupplier
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during moving supplier to pipeline: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Move Supplier to ApprovedSupplier.
 *
 * @param {object} auth - req auth.
 * @param {string} supplierId - Id of supplier.
 * @returns {object} -  An object with the results, including the new Approved Supplier.
 */
exports.moveToApprovedSupplier = async (auth, supplierId) => {
    try {
        const findSupplier = await query.findOne(supplierModel, { _id: supplierId });
        if (!findSupplier) {
            return {
                success: false,
                message: 'Supplier not found!'
            };
        }
        if (findSupplier.level == 3) {
            return {
                success: false,
                message: 'Supplier is already approved!'
            };
        }
        const { _id, email, fname, lname } = auth;
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Supplier moved to ApprovedSupplier by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}.`
        };
        let updateData = { level: 3, isApproved: true };
        updateData['$push'] = { Activity: obj };
        const updateSupplier = await supplierModel.findOneAndUpdate({ _id: supplierId }, updateData, { new: true, runValidators: true });
        if (updateSupplier) {
            return {
                success: true,
                message: `Supplier approved succcessfully.`,
                data: updateSupplier
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during moving supplier to ApprovedSupplier: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Move Supplier to ApprovedSupplier.
 *
 * @param {string} orgId - Id of organisation
 * @param {string} searchString - search string to search items by their part nunmber
 * @param {string} exactMatch - yes/no
 * @returns {object} -  An object with the results, including the new Approved Supplier.
 */
exports.searchIteamForEnquiry = async (orgId, searchString, exactMatch) => {
    try {

        const data = await query.aggregation(supplierItemsModel, supplierDao.searchIteamForEnquiry(orgId, searchString, exactMatch));
        if (data.length > 0) {
            return {
                success: true,
                message: 'Supplier item fetched for enquiry',
                data
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during moving supplier to ApprovedSupplier: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};