const express = require('express');
const fs = require('fs');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { upload } = require('../utils/multer');
const { statusCode } = require('../../config/default.json');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { enquiryItemService } = require('../services');
const { enquiryItemValidators: {
    createEnquiryItem,
    updateEnquiryItemById,
    addEnquirySupplierSelectedItem,
    addFinanceDetailsSuppler
} } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/enquiryItem';

/**
 * Route for creating a new enquiry item.
 */
router.post('/create', jwtVerify, validate(createEnquiryItem), async (req, res) => {
    try {
        const result = await enquiryItemService.createEnquiryItem(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/create: ${err.message}`);
        logger.error(`${LOG_ID} - Error (enquiryItem/create)`, JSON.stringify(err));
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for upadting enquiry item.
 */
router.post('/update/:id', jwtVerify, validate(updateEnquiryItemById), async (req, res) => {
    try {
        const result = await enquiryItemService.updateEnquiryItemById(req.auth, req.params.id, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/update/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting enquiry item.
 */
router.get('/delete/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryItemService.delete(req.auth, req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/delete/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for uploading enquiry items in bulk.
 */
router.post('/bulkupload/:id', jwtVerify, upload.single('file'), async (req, res) => {
    try {
        logger.info(LOG_ID, `File to read all item's | File Path :- ${req.file.path}`);
        console.log('req.file', req.file);
        const result = await enquiryItemService.itemBulkUpload(req.auth, req.params.id, req.file.path);
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.log(err);
                logger.error(LOG_ID, `Error occurred while remove file from path (${req.file.path}) : ${err.message}`);
                return;
            }
            logger.info(LOG_ID, `Enquiry Item | File removed successfully | File Path :- ${req.file.path}`);
        });
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/bulkupload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for Adding Enquiry Supplier Selected Item
 */
router.post('/addEnquirySupplierSelectedItem', jwtVerify, validate(addEnquirySupplierSelectedItem), async (req, res) => {
    try {
        const result = await enquiryItemService.addEnquirySupplierSelectedItem(req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/addEnquirySupplierSelectedItem: ${err.message}`);
        logger.error(`${LOG_ID} - Error (enquiryItem/addEnquirySupplierSelectedItem)`, JSON.stringify(err));
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deselecting Enquiry Supplier Selected Item.
 */
router.post('/deleteEnquirySupplierSelectedItem', jwtVerify, async (req, res) => {
    // router.get('/deleteEnquirySupplierSelectedItem/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryItemService.deleteEnquirySupplierSelectedItem(req.auth, req.body.ids);
        // const result = await enquiryItemService.deleteEnquirySupplierSelectedItem(req.auth, req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/deleteEnquirySupplierSelectedItem/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route of skipping mail for Enquiry Supplier Selected Item.
 */
router.post('/enquirySupplierSelectedItem/skipMail', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryItemService.SkipMailForEnquirySupplierSelectedItem(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/enquirySupplierSelectedItem/skipMail/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route of skipping mail for Enquiry Supplier Selected Item.
 */
router.post('/enquirySupplierSelectedItem/sendMail/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryItemService.sendMailForEnquirySupplierSelectedItem(req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/enquirySupplierSelectedItem/sendMail/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for uploading enquiry items in bulk.
 */
router.post('/itemsSheetBySupplerUpload/:id?', jwtVerify, upload.single('file'), async (req, res) => {
    try {
        logger.info(LOG_ID, `File to read all item's | File Path :- ${req.file.path}`);
        console.log('req.file', req.file);
        const result = await enquiryItemService.itemSheetBySupplerUpload(req.auth, req.file.path);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/bulkupload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});


/**
 * Route for uploading enquiry items in bulk.
 */
router.post('/addFinanceDetailsSuppler/:enquiryId/:supplierId', jwtVerify, validate(addFinanceDetailsSuppler), async (req, res) => {
    try {
        const result = await enquiryItemService.addFinanceDetailsSuppler(req.auth, req.params.enquiryId, req.params.supplierId, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/bulkupload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting Items Data Of Supplier For Enquiry Supplier Selected Item
 */
router.get('/getIteamsSupplierResponse/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryItemService.getIteamsSupplierResponse(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/getRecommendedSupplier/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting Compare Suppliers and Items as per Supplier’s quotes
 */
router.get('/getSupplierQuoteForCompare/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryItemService.CompareSuppliersAndItemsAsPerSuppliersQuotes(req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/getSupplierQuoteForCompare/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for short listing the Items Data Of Supplier For Enquiry Supplier Selected Item
 */
router.post('/shortList/:enquiryId', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryItemService.shortListTheITemsOfEnquiry(req.auth, req.params.enquiryId, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiryItem/bulkupload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});


module.exports = router;