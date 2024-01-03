const moment = require('moment');
const XLSX = require('xlsx');

// Local Import
// const { leadDao } = require('../dao');
const { enquiryModel, enquiryItemModel, supplierItemsModel, supplierModel, enquirySupplierSelectedItemsModel, supplierContactModel } = require('../dbModel');
const { query } = require('../utils/mongodbQuery');
const { enquiryDao } = require('../dao');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/enquiryItemService';

/**
 * Creates a new enquiry item.
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} enquiryItemData - Data for creating a new enquiry item.
 * @returns {object} - An object with the results, including the new enquiry item.
 */
exports.createEnquiryItem = async (auth, enquiryItemData) => {
    try {
        const { email, _id, fname, lname } = auth;

        const findenquiry = await query.findOne(enquiryModel, { _id: enquiryItemData.enquiryId, isActive: true, isDeleted: false });
        // console.log('findenquiry>>>>>>>>>>>>>', findenquiry);
        if (!findenquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }

        const findUniqueName = await query.findOne(enquiryItemModel, { partNumber: enquiryItemData.partNumber, enquiryId: enquiryItemData.enquiryId, isDeleted: false });
        if (findUniqueName) {
            return {
                success: false,
                message: 'Enquiry item part number already exist.'
            };
        }
        let obj = {
            performedBy: _id,
            performedByEmail: email,
            actionName: `Enquiry item added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findenquiry.Activity.push(obj);
        enquiryItemData.createdBy = _id;
        enquiryItemData.partNumberCode = enquiryItemData.partNumber.replace(/[-/]/g, '').toLowerCase();
        const newenquiryItem = await query.create(enquiryItemModel, enquiryItemData);
        if (newenquiryItem) {
            await enquiryModel.updateOne({ _id: enquiryItemData.enquiryId }, { Activity: findenquiry.Activity, isItemAdded: true, stageName: 'Find_Suppliers' });
            return {
                success: true,
                message: 'Enquiry item added successfully.',
                data: newenquiryItem
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error while adding enquiry item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Updates a enquiry Item by ID.
 *
 * @param {string} auth - req.auth.
 * @param {string} _id - The ID of the enquiry Item be updated.
 * @param {string} body - Updated data for the enquiry Item.
 * @returns {object} - An object with the results, including updated enquiry Item.
 */
exports.updateEnquiryItemById = async (auth, _id, body) => {
    try {
        const findData = await query.findOne(enquiryItemModel, { _id, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Enquiry Item not found.'
            };
        }
        const findenquiry = await query.findOne(enquiryModel, { _id: findData.enquiryId, isActive: true, isDeleted: false });
        // console.log('findenquiry>>>>>>>>>>>>>', findenquiry);
        if (!findenquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }
        if (body.partNumber) {
            const findUniqueName = await query.findOne(enquiryItemModel, { partNumber: body.partNumber, enquiryId: findenquiry.enquiryId, isDeleted: false });
            if (findUniqueName) {
                return {
                    success: false,
                    message: 'Enquiry item part number already exist.'
                };
            }
            body.partNumberCode = body.partNumber.replace(/[-/]/g, '').toLowerCase();
        }

        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Enquiry item update by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findenquiry.Activity.push(obj);
        body.updatedBy = auth._id;
        const data = await enquiryItemModel.findByIdAndUpdate(_id, body, { new: true, runValidators: true });
        if (data) {
            await enquiryModel.updateOne({ _id: findenquiry._id }, { Activity: findenquiry.Activity });
            return {
                success: true,
                message: 'Enquiry item updated successfully.',
                data
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error updating enquiry item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Deletes a enquiry item by ID.
 *
 * @param {string} auth - req.auth.
 * @param {string} _id - The ID of the enquiry item to be deleted.
 * @returns {object} - An object with the results.
 */
exports.delete = async (auth, _id) => {
    try {
        const findData = await query.findOne(enquiryItemModel, { _id, isDeleted: false });
        if (!findData) {
            return {
                success: false,
                message: 'Enquiry Item not found.'
            };
        }

        const findenquiry = await query.findOne(enquiryModel, { _id: findData.enquiryId, isActive: true, isDeleted: false });
        // console.log('findenquiry>>>>>>>>>>>>>', findenquiry);
        if (!findenquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }
        const data = await enquiryItemModel.findByIdAndUpdate(_id, { isDeleted: true });
        if (!data) {
            return {
                success: false,
                message: 'Enquiry Item not found.'
            };
        }
        let obj = {
            performedBy: auth._id,
            performedByEmail: auth.email,
            actionName: `Enquiry item deleted by ${auth.fname} ${auth.lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
        };
        findenquiry.Activity.push(obj);
        await enquiryModel.updateOne({ _id: findenquiry._id }, { Activity: findenquiry.Activity });
        return {
            success: true,
            message: 'Enquiry item deleted successfully.'
        };
    } catch (error) {
        logger.error(LOG_ID, `Error deleting enquiry: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Bulk upload and insert multiple enquiry iteams.
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} enquiryId - id of enquiry.
 * @param {string} path - path of uploaded file.
 * @returns {object} - An object with the results.
 */
exports.itemBulkUpload = async (auth, enquiryId, path) => {
    try {
        const { email, _id, fname, lname } = auth;
        const constData = ['partNumber', 'partDesc', 'hscode', 'unitPrice', 'quantity', 'delivery', 'notes'];
        const workbook = XLSX.readFile(path);
        const sheetNames = workbook.SheetNames;
        const worksheet = workbook.Sheets[sheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const documentsToSave = [];
        for (let i = 1; i < jsonData.length; i++) {
            let obj = { enquiryId, createdBy: _id };
            for (let j = 0; j < jsonData[i].length; j++) {
                if (!jsonData[i][j]) jsonData[i][j] = 'N/A';
                if (j == 0) {
                    obj['partNumberCode'] = `${jsonData[i][j]}`.replace(/[-/]/g, '').toLowerCase();
                }
                obj[constData[j]] = (constData[j] == 'unitPrice' || constData[j] == 'quantity') ? +jsonData[i][j] || 0 : jsonData[i][j];
            }
            documentsToSave.push(obj);
        }
        let data = await enquiryItemModel.insertMany(documentsToSave);
        if (data.length > 0) {
            let obj = {
                performedBy: _id,
                performedByEmail: email,
                actionName: `Enquiry item (bulk upload item quantity :- ${data.length}) added by ${fname} ${lname} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
            };
            await enquiryModel.updateOne({ _id: enquiryId }, { $push: { Activity: obj }, stageName: 'Find_Suppliers', isItemAdded: true });
            return {
                success: true,
                message: 'Enquiry iteam bulk upload',
                data: data
            };
        }
        return {
            success: false,
            message: 'Error while enquiry iteam bulk upload',
            data: []
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while uploading enquiry iteam in bulk: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Add Enquiry Supplier Selected Item
 *
 * @param {object} auth - Data of logedin user.
 * @param {object} body - Enquiry Supplier Selected Item data
 * @returns {object} - An object with the results.
 */
exports.addEnquirySupplierSelectedItem = async (auth, body) => {
    try {
        const { email, _id, fname, lname } = auth;

        const findAlreadyExist = await query.findOne(enquirySupplierSelectedItemsModel, {
            enquiryId: body.enquiryId,
            enquiryItemId: body.enquiryItemId,
            supplierId: body.supplierId,
            supplierItemId: body.supplierItemId
        });
        if (findAlreadyExist) {
            return {
                success: false,
                message: `This enquiry item has already been associated with the specified supplier and their item.`
            };
        }
        const findEnquiry = await query.findOne(enquiryModel, { _id: body.enquiryId, isDeleted: false });
        if (!findEnquiry) {
            return {
                success: false,
                message: 'Enquiry not found.'
            };
        }
        const findEnquiryItem = await query.findOne(enquiryItemModel, { _id: body.enquiryItemId, isDeleted: false });
        if (!findEnquiryItem) {
            return {
                success: false,
                message: 'Enquiry item not found.'
            };
        }
        // console.log('body.quantity > findEnquiryItem.quantity', body.quantity, findEnquiryItem.quantity);
        if (+body.quantity > +findEnquiryItem.quantity) {
            return {
                success: false,
                message: `You can not select not item quantity more then  ${findEnquiryItem.quantity}`
            };
        }
        const findSupplier = await query.findOne(supplierModel, { _id: body.supplierId, isActive: true });
        if (!findSupplier) {
            return {
                success: false,
                message: 'Suppleir not found.'
            };
        }
        const findSupplierItem = await query.findOne(supplierItemsModel, { _id: body.supplierItemId, isDeleted: false });
        if (!findSupplierItem) {
            return {
                success: false,
                message: 'Supplier item not found.'
            };
        }
        const findSupplierContact = await query.findOne(supplierContactModel, { _id: body.supplierContactId, isDeleted: false });
        if (!findSupplierContact) {
            return {
                success: false,
                message: 'Supplier contact not found'
            };
        }
        body.createdBy = _id;
        body.updatedBy = _id;
        const save = await query.create(enquirySupplierSelectedItemsModel, body);
        save._doc.isSelected = true;
        if (save) {
            let obj = {
                performedBy: _id,
                performedByEmail: email,
                actionName: `Enquiry supplier item selected by ${fname} ${lname} | supplier - ${findSupplier.companyName} | suppler Item - ${findSupplierItem.partNumber} | enquiry Item - ${findEnquiryItem.partNumber} | at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
            };
            await enquiryModel.updateOne({ _id: body.enquiryId }, { $push: { Activity: obj }, stageName: 'Compare_Suppliers_Quote' });
            return {
                success: true,
                message: 'Enquiry supplier item selected successfully.',
                data: save
            };
        }
        return {
            success: false,
            message: 'Error while selecting enquiry supplier item.'
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while adding enquiry supplier selected item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Deleted Enquiry Supplier Selected Item
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} enquirySupplierSelectedItemId - Enquiry Supplier Selected Item id
 * @returns {object} - An object with the results.
 */
exports.deleteEnquirySupplierSelectedItem = async (auth, enquirySupplierSelectedItemId) => {
    try {
        const { email, _id, fname, lname } = auth;

        const find = await query.findOne(enquirySupplierSelectedItemsModel, { _id: enquirySupplierSelectedItemId });
        if (!find) {
            return {
                success: false,
                message: `This enquiry item is not associated with the any supplier and their item.`
            };
        }
        if (find.isMailSent || find.isSkipped) {
            return {
                success: false,
                message: `Mail is already ${find.isMailSent ? 'sent' : 'skipped'} for this enquiry item. You can't deselect the enquiry supplier item now.`
            };
        }
        const deleteData = await enquirySupplierSelectedItemsModel.deleteOne({ _id: enquirySupplierSelectedItemId });
        if (deleteData) {
            let obj = {
                performedBy: _id,
                performedByEmail: email,
                actionName: `Enquiry supplier item deselected by ${fname} ${lname} | supplier - ${find.companyName} | suppler Item - ${find.partNumber} | enquiry Item - ${find.partNumber} | at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
            };
            await enquiryModel.updateOne({ _id: find.enquiryId }, { $push: { Activity: obj }, stageName: 'Find_Suppliers' });
            return {
                success: true,
                message: 'Enquiry supplier item deselected successfully.',
                data: {}
            };
        }
        return {
            success: false,
            message: 'Error while deselecting enquiry supplier item.'
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while deleting enquiry supplier selected item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Deleted Enquiry Supplier Selected Item
 *
 * @param {string} enquirySupplierSelectedItemId - Enquiry Supplier Selected Item id
 * @param {object} updateData - Data of Enquiry Supplier Selected Item.
 * @returns {object} - An object with the results.
 */
exports.sendOrSkipMailForEnquirySupplierSelectedItem = async (enquirySupplierSelectedItemId, updateData) => {
    try {
        // const { email, _id, fname, lname } = auth;

        const find = await query.findOne(enquirySupplierSelectedItemsModel, { _id: enquirySupplierSelectedItemId });
        if (!find) {
            return {
                success: false,
                message: `This enquiry item is not associated with the any supplier and their item.`
            };
        }
        if (find.isMailSent || find.isSkipped) {
            return {
                success: false,
                message: `Mail is already ${find.isMailSent ? 'sent' : 'skipped'} for this enquiry item.`
            };
        }
        const update = await enquirySupplierSelectedItemsModel.findByIdAndUpdate(enquirySupplierSelectedItemId, updateData, { new: true, runValidators: true });
        if (update) {
            return {
                success: true,
                message: `Enquiry item mail ${update.isMailSent ? 'sent to supplier' : 'skipped'}.`,
                data: update
            };
        }
        return {
            success: false,
            message: `Error while ${updateData.isMailSent ? 'sending mail to supplier' : 'skipping mail'}.`,
            data: update
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while sending Or Skiping Mail For Enquiry Supplier Selected Item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Bulk upload and insert multiple enquiry iteams.
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} path - path of uploaded file.
 * @returns {object} - An object with the results.
 */
exports.itemSheetBySupplerUpload = async (auth, path) => {
    try {
        const { _id } = auth;
        const constData = ['_id', 'partNumber', 'partDesc', 'quantity', 'hscode', 'unitPrice', 'delivery', 'notes'];
        const workbook = XLSX.readFile(path);
        const sheetNames = workbook.SheetNames;
        const worksheet = workbook.Sheets[sheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const documentsToSave = [];
        for (let i = 1; i < jsonData.length; i++) {
            let obj = { createdBy: _id };
            for (let j = 0; j < jsonData[i].length; j++) {
                if (!jsonData[i][j]) jsonData[i][j] = 'N/A';
                if (j == 1) {
                    obj['partNumberCode'] = `${jsonData[i][j]}`.replace(/[-/]/g, '').toLowerCase();
                }
                obj[constData[j]] = (constData[j] == 'unitPrice' || constData[j] == 'quantity') ? +jsonData[i][j] || 0 : jsonData[i][j];
            }
            obj['total'] = obj.quantity * obj.unitPrice;
            documentsToSave.push(obj);
        }
        if (documentsToSave.length == jsonData.length - 1) {
            updateDataToDbForEnquirySupplierSelectedItem(documentsToSave, path);
            return {
                success: true,
                message: 'Supplier sheet uploaded successfully'
            };
        }
        return {
            success: false,
            message: 'Error while enquiry iteam bulk upload',
            data: []
        };
    } catch (error) {
        logger.error(LOG_ID, `Error while uploading enquiry iteam in bulk: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Add Finance Details For Enquiry Supplier Selected Item
 *
 * @param {object} auth - Data of logedin user.
 * @param {string} enquiryId - Enquiry id
 * @param {string} suppierId - Supplier id
 * @param {object} body - Data of finance.
 * @returns {object} - An object with the results.
 */
exports.addFinanceDetailsSuppler = async (auth, enquiryId, suppierId, body) => {
    try {
        const { _id } = auth;
        console.log('enquiryId, suppierId::::::::::', enquiryId, suppierId);
        const find = await query.find(enquirySupplierSelectedItemsModel, { $and: [{ enquiryId: { $eq: enquiryId } }, { suppierId: { $eq: suppierId } }] });
        console.log('finsd:::::::::::::', find.length);
        if (find.length == 0) {
            return {
                success: false,
                message: `This enquiry item is not associated with the any supplier and their item.`
            };
        }
        body.createdBy = _id;
        body.updatedBy = _id;
        const updatedData = await enquirySupplierSelectedItemsModel.updateMany({ $and: [{ enquiryId: { $eq: enquiryId } }, { suppierId: { $eq: suppierId } }] }, { financeMeta: body });
        console.log('updatedData:::::::::::::::', updatedData);
        if (updatedData) {
            body.suppierId = suppierId;
            return {
                success: true,
                message: 'Finance details for enquiry supplier selected items added successfully',
                data: body
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error While Adding Finance Details For Enquiry Supplier Selected Item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Get Items Data Of Supplier For Enquiry Supplier Selected Item
 *
 * @param {string} enquiryId - Enquiry id
 * @returns {object} - An object with the results.
 */
exports.getIteamsSupplierResponse = async (enquiryId) => {
    try {
        const findData = await query.find(enquirySupplierSelectedItemsModel, { enquiryId });
        if (findData.length == 0) {
            return {
                success: false,
                message: 'This enquiry item is not associated with the any supplier and their item.'
            };
        }
        const IteamsSpllierResponse = await query.aggregation(enquirySupplierSelectedItemsModel, enquiryDao.getIteamsSupplierResponse(enquiryId));
        if (IteamsSpllierResponse.length > 0) {
            return {
                success: true,
                message: 'Items data of supplier for enquiry supplier selected item fetched successfully.',
                data: IteamsSpllierResponse
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error While Getting Items Data Of Supplier For Enquiry Supplier Selected Item: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

// exports.sendMailToSupplier = async () => {
//     try {

//     } catch (error) {
//         logger.error(LOG_ID, `Error While sending mail to supplier: ${error}`);
//         return {
//             success: false,
//             message: 'Something went wrong'
//         };
//     }
// };

/**
 * Updates data for selected items in the Enquiry Supplier.
 *
 * @param {Array} data - An array of items to be updated.
 * @param {string} path - The path to the items sheet.
 * @returns {Promise<void>} - A Promise that resolves after the update operation.
 */
async function updateDataToDbForEnquirySupplierSelectedItem(data, path) {
    try {
        // console.log('path:::::::::::', path);
        for (let ele of data) {
            let _id = ele._id;
            delete ele._id;
            // console.log('ele:>>>', ele);
            // const update = 
            await enquirySupplierSelectedItemsModel.updateOne({ _id }, { finalItemDetails: ele, itemsSheet: path });
            // const find = await query.findOne(enquirySupplierSelectedItemsModel, { _id: _id });
            // console.log('update>>>>>>>', update);
        }
    } catch (error) {
        logger.error(LOG_ID, `Error while uploading enquiry iteam in bulk: ${error}`);
        // return {
        //     success: false,
        //     message: 'Something went wrong'
        // };
    }
}