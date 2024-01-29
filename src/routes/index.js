const { apiV1Prefix } = require('../../config/default.json');

/**
 * configuration of all routes
 *
 * @param {app} app the express server instance
 */
module.exports = (app) => {
    // console.log(app);
    app.use(apiV1Prefix, require('./heartBeat'));
    app.use(`${apiV1Prefix}/user`, require('./user'));
    app.use(`${apiV1Prefix}/currency`, require('./currency'));
    app.use(`${apiV1Prefix}/vat`, require('./vat'));
    app.use(`${apiV1Prefix}/paymentTerms`, require('./paymentTerms'));
    app.use(`${apiV1Prefix}/organisation`, require('./organisation'));
    app.use(`${apiV1Prefix}/organisationAddress`, require('./organisationAddress'));
    app.use(`${apiV1Prefix}/exchangeRate`, require('./exchangeRate'));
    app.use(`${apiV1Prefix}/lead`, require('./lead'));
    app.use(`${apiV1Prefix}/leadContact`, require('./leadContact'));
    app.use(`${apiV1Prefix}/leadAddress`, require('./leadAddress'));
    app.use(`${apiV1Prefix}/supplier`, require('./supplier'));
    app.use(`${apiV1Prefix}/supplierContact`, require('./supplierContact'));
    app.use(`${apiV1Prefix}/supplierAddress`, require('./supplierAddress'));
    app.use(`${apiV1Prefix}/supplierItem`, require('./supplierItem'));
    app.use(`${apiV1Prefix}/enquiry`, require('./enquiry'));
    app.use(`${apiV1Prefix}/enquiryItem`, require('./enquiryItem'));
    app.use(`${apiV1Prefix}/agent`, require('./agent'));
    app.use(`${apiV1Prefix}/warehouse`, require('./warehouse'));
    app.use(`${apiV1Prefix}/`, require('./upload'));
};