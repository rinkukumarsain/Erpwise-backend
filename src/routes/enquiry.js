const express = require('express');
const { validate } = require('express-validation');

// Local imports
const { logger } = require('../utils/logger');
const { statusCode } = require('../../config/default.json');
const { uploadS3 } = require('../utils/multer');
const { handleResponse, handleErrorResponse } = require('../helpers/response');
const { enquiryServices } = require('../services');
const { enquiryValidators: {
    createEnquiry,
    getAllEnquiry,
    deleteEnquiryDocument,
    updateEnquiryById,
    addReminder,
    // ==Quote== //
    createQuote,
    // ==PI== //
    createPI,
    // ==SO== //
    createSO,
    // ==SPO== //
    createSupplierPO,
    editSupplierPO,
    // ==OT== //
    createShipment,
    editShipment,
    readyForDispatch,
    shipmentDelivered,
    shipmentDispatched,
    warehouseGoodsOut
} } = require('../validators');
const { jwtVerify } = require('../middleware/auth');
// const { authorizeRoleAccess } = require('../middleware/authorizationCheck');
const router = express.Router();

const LOG_ID = 'routes/enquiry';

/**
 * Route for getting enquiry dashboard count.
 */
router.get('/dashboardcount', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.enquiryDashboardCount(req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting  enquiry dashboard count: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for creating enquiry.
 */
router.post('/create', jwtVerify, validate(createEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.createEnquiry(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating new enquiry: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for update enquiry By Id
 */
router.post('/update/:id', jwtVerify, validate(updateEnquiryById), async (req, res) => {
    try {
        const result = await enquiryServices.updateEnquiryById(req.auth, req.params.id, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/update/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all enquiries.
 */
router.get('/getAll', jwtVerify, validate(getAllEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.getAllEnquiry(req.headers['x-org-type'], req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting all enquiries: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting enquiry By Id
 */
router.get('/delete/:enquiryId', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.deleteEnquiry(req.params.enquiryId, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/delete/:enquiryId : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting enquiry by id.
 */
router.get('/get/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.getEnquiryById(req.headers['x-org-type'], req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/get/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting Recommended Supplier With Items.
 */
router.get('/getRecommendedSupplier/:id', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.getRecommendedSupplierWithItems(req.params.id, req.headers['x-org-type']);
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
 * Route for uploading enquiry document.
 */
router.post('/upload/:id', jwtVerify, uploadS3.single('image'), async (req, res) => {
    try {
        const result = await enquiryServices.uploadEnquiryDocument(req.params.id, req.file, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/upload/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting enquiry document.
 */
router.post('/deleteDocument/:id', jwtVerify, validate(deleteEnquiryDocument), async (req, res) => {
    try {
        const result = await enquiryServices.deleteEnquiryDocument(req.params.id, req.body.imageUrl, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/deleteDocument/:id : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route of getting mail logs
 */
router.get('/maillogs/:type/:enquiryId', jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.getMailLogs(req.params.type, req.params.enquiryId);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry/maillogs : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for Adding enquiry reminder.
 */
router.post('/addreminder/:id', jwtVerify, validate(addReminder), async (req, res) => {
    try {
        const result = await enquiryServices.addReminder(req.params.id, req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during adding enquiry reminder: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

// ========================= QUOTE ============================= //

let preFix = '/quote';
/**
 * Route for creating enquiry quote.
 */
router.post(`${preFix}/create`, jwtVerify, validate(createQuote), async (req, res) => {
    try {
        const result = await enquiryServices.createQuote(req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating new enquiry quote: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for delete enquiry quote By Id
 */
router.get(`${preFix}/delete/:id`, jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.deleteQuote(req.params.id, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while deleting enquiry quote by id: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

// /**
//  * Route for editing enquiry quote.
//  */
// router.post(`${preFix}/update/:id`, jwtVerify, validate(createQuote), async (req, res) => {
//     try {
//         const result = await enquiryServices.updateQuote(req.params.id, req.auth, req.body);
//         if (result.success) {
//             return handleResponse(res, statusCode.OK, result);
//         }
//         return handleResponse(res, statusCode.BAD_REQUEST, result);
//     } catch (err) {
//         logger.error(LOG_ID, `Error occurred while creating new enquiry quote: ${err.message}`);
//         handleErrorResponse(res, err.status, err.message, err);
//     }
// });

/**
 * Route for getting all/one enquiry quote's
 */
router.get(`${preFix}/getAll/:enquiryId/:id?`, jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.getQuote(req.params.enquiryId, req.params.id);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting enquiry quote's: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all enquiry quote.
 */
router.get(`${preFix}/getAllData`, jwtVerify, validate(getAllEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.getAllQuote(req.headers['x-org-type'], req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting all enquiry quote: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route of sending mail for enquiry quote.
 */
router.post(`${preFix}/sendMail`, jwtVerify, uploadS3.single('file'), async (req, res) => {
    try {
        const result = await enquiryServices.sendMailForEnquiryQuote(req.body, req.file);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry${preFix}/sendMail : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for Adding enquiry quote reminder.
 */
router.post(`${preFix}/addreminder/:id`, jwtVerify, validate(addReminder), async (req, res) => {
    try {
        const result = await enquiryServices.addQuoteReminder(req.params.id, req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during adding enquiry quote reminder: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

// ========================= PI ============================= //

let piPreFix = '/pi';

/**
 * Route for creating enquiry pi.
 */
router.post(`${piPreFix}/create/:enquiryId`, jwtVerify, validate(createPI), async (req, res) => {
    try {
        const result = await enquiryServices.createPI(req.params.enquiryId, req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating new enquiry pi: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting enquiry porforma invoice by enquiry id.
 */
router.get(`${piPreFix}/get/:enquiryId`, jwtVerify, validate(getAllEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.getPiById(req.params.enquiryId);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting enquiry pi by enquiry id: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all enquiry porforma invoice.
 */
router.get(`${piPreFix}/getAll`, jwtVerify, validate(getAllEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.getAllPorformaInvoice(req.headers['x-org-type'], req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting all enquiry porforma invoice: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry porforma invoice.
 */
router.post(`${piPreFix}/update/:enquiryId`, jwtVerify, validate(createPI), async (req, res) => {
    try {
        const result = await enquiryServices.updatePI(req.params.enquiryId, req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating new enquiry porforma invoice: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting enquiry porforma invoice.
 */
router.get(`${piPreFix}/delete/:enquiryId`, jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.deletePI(req.params.enquiryId, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while deleting enquiry porforma invoice: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route of sending mail for enquiry porforma invoice.
 */
router.post(`${piPreFix}/sendMail`, jwtVerify, uploadS3.single('file'), async (req, res) => {
    try {
        const result = await enquiryServices.sendMailForEnquiryPI(req.body, req.file);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry${piPreFix}/sendMail : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for Adding enquiry reminder.
 */
router.post(`${piPreFix}/addreminder/:id`, jwtVerify, validate(addReminder), async (req, res) => {
    try {
        const result = await enquiryServices.addPIReminder(req.params.id, req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during adding enquiry reminder: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

// ========================= Sales Order ============================= //

let soPreFix = '/so';

/**
 * Route for creating enquiry so.
 */
router.post(`${soPreFix}/create/:enquiryId`, jwtVerify, validate(createSO), async (req, res) => {
    try {
        const result = await enquiryServices.createSO(req.params.enquiryId, req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating new enquiry so: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});



/**
 * Route for getting enquiry sales order by enquiry id.
 */
router.get(`${soPreFix}/get/:enquiryId/:po?`, jwtVerify, validate(getAllEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.getSOById(req.params.enquiryId, req.params.po);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting enquiry so by enquiry id: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all enquiry sales order.
 */
router.get(`${soPreFix}/getAll`, jwtVerify, validate(getAllEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.getAllSalesOrder(req.headers['x-org-type'], req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting all enquiry sales order: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry sales order.
 */
router.post(`${soPreFix}/update/:enquiryId`, jwtVerify, validate(createSO), async (req, res) => {
    try {
        const result = await enquiryServices.updateSO(req.params.enquiryId, req.auth, req.body);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating new enquiry sales order: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting enquiry sales order.
 */
router.get(`${soPreFix}/delete/:enquiryId`, jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.deleteSO(req.params.enquiryId, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while deleting enquiry sales order: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for Adding enquiry reminder.
 */
router.post(`${soPreFix}/addreminder/:id`, jwtVerify, validate(addReminder), async (req, res) => {
    try {
        const result = await enquiryServices.addSOReminder(req.params.id, req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during adding enquiry reminder: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

// ========================= Supplier po ============================= //

const spoPreFix = '/spo';

/**
 * Route for creating enquiry supplier po.
 */
router.post(`${spoPreFix}/create/:enquiryId`, jwtVerify, validate(createSupplierPO), async (req, res) => {
    try {
        const result = await enquiryServices.createSupplierPO(req.params.enquiryId, req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating new enquiry Supplier po: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all supplier po by enquiry id.
 */
router.get(`${spoPreFix}/get/:enquiryId`, jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.getAllSupplierPoOfEnquiry(req.params.enquiryId, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting all supplier po by enquiry id: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting all supplier po.
 */
router.get(`${spoPreFix}/getAll`, jwtVerify, validate(getAllEnquiry), async (req, res) => {
    try {
        const result = await enquiryServices.getAllSupplierPO(req.headers['x-org-type'], req.query);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting all supplier po by enquiry id: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry supplier po.
 */
router.post(`${spoPreFix}/update/:supplierPoId`, jwtVerify, validate(editSupplierPO), async (req, res) => {
    try {
        const result = await enquiryServices.editSupplierPO(req.params.supplierPoId, req.auth, req.body, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while editing new enquiry Supplier po: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route of sending mail for enquiry Supplier PO.
 */
router.post(`${spoPreFix}/sendMail`, jwtVerify, uploadS3.single('file'), async (req, res) => {
    try {
        const result = await enquiryServices.sendMailForEnquirySupplierPO(req.body, req.file);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred during enquiry${spoPreFix}/sendMail : ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

// ========================= Order Tracking ============================= //

const otPreFix = '/ot';
const ship = '/shipment';

/**
 * Route for creating shippment from enquiry supplier po.
 */
router.post(`${otPreFix}${ship}/create/`, jwtVerify, validate(createShipment), async (req, res) => {
    try {
        // jsashkasjdh
        const result = await enquiryServices.createShipment(req.body, req.headers['x-org-type'], req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while creating shippment from enquiry supplier po: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for getting All Supplier With Items And Po With Shipments
 */
router.get(`${otPreFix}${ship}/get/:enquiryId`, jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.getAllSupplierWithItemsAndPoWithShipments(req.params.enquiryId, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while getting All Supplier With Items And Po With Shipments: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry item shipment by id.
 */
router.post(`${otPreFix}${ship}/update/:enquiryId/:shipmentId`, jwtVerify, validate(editShipment), async (req, res) => {
    try {
        const result = await enquiryServices.editShipment(req.params.enquiryId, req.params.shipmentId, req.headers['x-org-type'], req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while editing enquiry item shipment by id: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for deleting enquiry item shipment by id.
 */
router.get(`${otPreFix}${ship}/delete/:enquiryId/:shipmentId`, jwtVerify, async (req, res) => {
    try {
        const result = await enquiryServices.deleteShipment(req.params.enquiryId, req.params.shipmentId, req.headers['x-org-type']);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while deleting enquiry item shipment by id.: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry item shipment by id, update status to Ready For Dispatch.
 */
router.post(`${otPreFix}${ship}/rod/:enquiryId/:shipmentId`, jwtVerify, validate(readyForDispatch), async (req, res) => {
    try {
        const result = await enquiryServices.shipmentReadyForDispatch(req.params.enquiryId, req.params.shipmentId, req.headers['x-org-type'], req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while enquiry item shipment by id update status to Ready For Dispatch: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry item shipment by id, update status to Shipment Dispatched.
 */
router.post(`${otPreFix}${ship}/sd/:enquiryId/:shipmentId`, jwtVerify, validate(shipmentDispatched), async (req, res) => {
    try {
        const result = await enquiryServices.shipmentShipmentDispatched(req.params.enquiryId, req.params.shipmentId, req.headers['x-org-type'], req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while enquiry item shipment by id update status to Shipment Dispatched: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry item shipment by id, update status to warehouse Goods Out.
 */
router.post(`${otPreFix}${ship}/wgo/:enquiryId/:shipmentId`, jwtVerify, validate(warehouseGoodsOut), async (req, res) => {
    try {
        const result = await enquiryServices.shipmentWarehouseGoodsOut(req.params.enquiryId, req.params.shipmentId, req.headers['x-org-type'], req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while enquiry item shipment by id update status to warehouse Goods Out: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

/**
 * Route for editing enquiry item shipment by id update status to shipment delivered.
 */
router.post(`${otPreFix}${ship}/sde/:enquiryId/:shipmentId`, jwtVerify, validate(shipmentDelivered), async (req, res) => {
    try {
        const result = await enquiryServices.shipmentShipmentDelivered(req.params.enquiryId, req.params.shipmentId, req.headers['x-org-type'], req.body, req.auth);
        if (result.success) {
            return handleResponse(res, statusCode.OK, result);
        }
        return handleResponse(res, statusCode.BAD_REQUEST, result);
    } catch (err) {
        logger.error(LOG_ID, `Error occurred while enquiry item shipment by id, update status to shipment delivered: ${err.message}`);
        handleErrorResponse(res, err.status, err.message, err);
    }
});

module.exports = router;