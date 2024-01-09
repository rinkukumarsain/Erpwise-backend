const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();
const cors = require('cors');
const { logger } = require('../utils/logger');
require('dotenv').config();

// local imports
const {connectDB } = require('../dataSource/dbConnections');
const { globalErrors, routeNotFound } = require('../helpers/errorHandlers');

const LOG_ID = 'server/app';

// pre-routes
logger.info(LOG_ID, '~~~ setting up middlewares for app ~~~');
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

connectDB();

// routes
require('../routes')(app);

//  error
app.use(routeNotFound);
app.use(globalErrors);

exports.app = app;
