const bcrypt = require('bcryptjs');
// const Redis = require('ioredis');
// const redis = new Redis(); // Connect to the default Redis server on localhost

// Local Import
const { userModel, organisationModel } = require('../dbModel');
const { userDao } = require('../dao');
const { generateAuthToken } = require('../utils/tokenGenerator');
const { roles } = require('../../config/default.json');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/userService';

/**
 * Authenticates a user by verifying their credentials.
 *
 * @param {object} reqBody - The request body containing `email` and `password`.
 * @returns {object} - An object with authentication results:
 *   - `success` (boolean): Indicates whether the authentication was successful.
 *   - `message` (string): A message describing the result of the authentication.
 *   - `data` (Object): User data if authentication is successful.
 *   - `token` (string): JWT token if authentication is successful.
 */
exports.login = async (reqBody) => {
    try {
        const { email, password } = reqBody;
        const findUser = await query.findOne(userModel, { email, isActive: true }, { _id: 1, password: 1 });
        if (!findUser) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        const isPasswordValid = await bcrypt.compare(password, findUser.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
        // console.log('findUser', findUser);
        const { data: userData } = await this.uesrProfile({ userId: findUser._id });
        // Generate a JWT token for the user.
        const token = generateAuthToken({
            userId: findUser._id,
            fname: userData.fname,
            lname: userData.lname,
            email: userData.email,
            role: userData.role
        });

        await userModel.updateOne({ _id: findUser._id }, { token });
        // userData.menuList = roleAccess[userData.role];
        let baseCurrencyData = userData.baseCurrencyData || {};
        delete userData.baseCurrencyData;
        return {
            success: true,
            message: 'You have successfully logged in to your account',
            data: userData,
            token,
            baseCurrencyData
        };
    } catch (error) {
        console.log(error);
        logger.error(LOG_ID, `Error occurred during login: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Finds profile of a user.
 *
 * @param {object} params - Parameters containing 'userId'.
 * @param {string} params.userId - The ID of the user to fetched his/her profile.
 * @returns {object} - An object with the results, including user details.
 */
exports.uesrProfile = async ({ userId }) => {
    try {
        // const data = await redis.get(`userprofile-${userId}`);
        // let findUser;
        // if (!data) {
        //     findUser = await query.aggregation(userModel, userDao.userProfilePipeline(userId));
        //     // console.log('findUser', findUser);
        //     await redis.set(`userprofile-${userId}`, JSON.stringify(findUser));
        // } else findUser = JSON.parse(data);

        // if (findUser.length == 0) {
        //     return {
        //         success: false,
        //         message: 'User not found'
        //     };
        // }
        const findUser = await query.aggregation(userModel, userDao.userProfilePipeline(userId));
        // console.log('findUser', findUser);
        if (findUser.length == 0) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        return {
            success: true,
            message: `Profile of ${findUser[0].name} fetched successfully.`,
            data: findUser[0]
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching user profile (uesrProfile): ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Registers a new user with the provided user data.
 *
 * @param {object} auth - The authentication details of the current user.
 * @param {object} body - The user data to be registered, including 'role', 'createdBy', and 'password' ..etc.
 * @returns {object} - An object with registration results:
 *   - `success` (boolean): Indicates whether the registration was successful.
 *   - `message` (string): A message describing the result of the registration.
 *   - `data` (Object): Registered user data if registration is successful.
 */
exports.registerUser = async (auth, body) => {
    try {
        if (!roles[body.role]) {
            return {
                success: false,
                message: `Please provide a valid role type.`
            };
        }

        if (roles[body.role] >= roles[auth.role]) {
            return {
                success: false,
                message: `This action requires a higher level of authorization.`
            };
        }

        const checkUniqueEmail = await query.findOne(userModel, { email: body.email });
        if (checkUniqueEmail) return {
            success: false,
            message: 'This email is already taken. Please choose a different one.',
            data: { email: body.email }
        };

        const checkUniqueEmployeeId = await query.findOne(userModel, { employeeId: body.employeeId });
        if (checkUniqueEmployeeId) return {
            success: false,
            message: 'This employee id is already taken. Please choose a different one.',
            data: { employeeId: body.employeeId }
        };

        const findCreatedByUser = await query.findOne(userModel, { _id: body.createdBy, isActive: true });
        if (!findCreatedByUser) {
            return {
                success: false,
                message: `The user who is creating this ${body.role} could not be found.`
            };
        }

        const findOrg = await query.findOne(organisationModel, { _id: body.organisationId });
        if (!findOrg) {
            return {
                success: false,
                message: `Organisation not found.`
            };
        }

        const salt = bcrypt.genSaltSync(10);
        body.password = await bcrypt.hashSync(body.password, salt);
        // body.employeeId = `EMP-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
        body.baseCurrency = findOrg.currency;
        let insertUser = await query.create(userModel, body);
        if (insertUser) {
            delete insertUser._doc.password;
            return {
                success: true,
                message: `${body.fname} created successfully.`,
                data: insertUser
            };
        } else {
            return {
                success: false,
                message: 'Error while creating user.'
            };
        }
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during registerUser: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};


/**
 *  Read operation - Get all users
 * 
 * @param {object} queryParam - optional query params
 * @param {string} orgId - organisational id from headers
 * @returns {object} - An object
 */
exports.getAllUsers = async (queryParam, orgId) => {
    try {
        if (!orgId) {
            return {
                success: false,
                message: 'Organisation not found.'
            };
        }
        const { isActive, isRole, page = 1, perPage = 10, sortBy, sortOrder, search } = queryParam;
        let obj = {};
        if (isActive) obj['isActive'] = isActive === 'true' ? true : false;
        // if (isRole == 'true') {
        //     obj['$or'] = [
        //         { role: 'admin' },
        //         { role: 'sales' }
        //     ];
        // }
        if (isRole) {
            if (isRole == 'salesperson') {
                obj['$or'] = [
                    { role: 'admin' },
                    { role: 'sales' }
                ];
            } else if (isRole == 'warehouse') {
                obj['role'] = 'warehouseManager';
            }
        }

        obj['organisationId'] = orgId;



        const userListCount = await query.find(userModel, obj, { _id: 1 });
        const totalPages = Math.ceil(userListCount.length / perPage);
        const userList = await query.aggregation(userModel, userDao.getAllUsersPipeline({ orgId, page: +page, perPage: +perPage, isActive, isRole, sortBy, sortOrder, search }));
        if (!userList.length) {
            return {
                success: true,
                message: 'User not found!',
                data: {
                    userList: [],
                    pagination: {
                        page,
                        perPage,
                        totalChildrenCount: 0,
                        totalPages: 0
                    }
                }
            };
        }
        return {
            success: true,
            message: 'User fetched successfully!',
            data: {
                userList,
                pagination: {
                    page,
                    perPage,
                    totalChildrenCount: userListCount.length,
                    totalPages
                }
            }
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting all users: ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};

/**
 * Read operation - Get user by id
 * 
 * @param {object} userId - optional query params
 * @returns {object} - An object
 */
exports.getUserById = async (userId) => {
    try {
        const userDetails = await query.findOne(userModel, { _id: userId, isActive: true }, { password: 0, token: 0 });
        if (!userDetails) {
            return {
                success: false,
                message: 'User not found!'
            };
        }
        return {
            success: true,
            message: 'User detail fetched successfully.',
            data: userDetails
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred while getting user by id: ${error}`);
        return {
            success: false,
            message: 'Something went wrong.'
        };
    }
};

/**
 * Edit user profile
 * 
 * @param {string} userId - req params
 * @param {object} updatedData - req body
 * @param {object} auth - req auth
 * @returns {object} - An object
 */
exports.editUser = async (userId, updatedData, auth) => {
    try {
        if (updatedData.email) {
            const checkUniqueEmail = await query.findOne(userModel, { _id: { $ne: userId }, email: updatedData.email });
            if (checkUniqueEmail) return {
                success: false,
                message: 'This email is already taken. Please choose a different one.'
            };
        }

        updatedData.updatedBy = auth._id;
        // Update the user's information
        const updateUser = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true });
        if (updateUser) {
            delete updateUser._doc.password;
            delete updateUser._doc.token;
            return {
                success: true,
                message: 'user profile updated successfully.',
                data: updateUser
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred while editing user profile: ${error}`);
        return {
            success: false,
            message: 'Something went wrong.'
        };
    }
};

/**
 * Enable/Disable user profile
 * 
 * @param {object} body - req body
 * @param {string} body.userId - user id
 * @param {boolean} body.isActive - req body (isActvie)(type bool)
 * @param {object} auth - req auth
 * @returns {object} - An object
 */
exports.enableOrDisableUser = async ({ userId, isActive }, auth) => {
    try {
        // Update the user's information
        const updateUser = await userModel.findOneAndUpdate({ _id: userId }, { isActive, updatedBy: auth._id }, { new: true });
        if (updateUser) {
            return {
                success: true,
                message: `User ${isActive ? 'enabled' : 'disabled'} successfully.`,
                data: { _id: userId }
            };
        }

    } catch (error) {
        logger.error(LOG_ID, `Error occurred while editing user profile: ${error}`);
        return {
            success: false,
            message: 'Something went wrong.'
        };
    }
};

/**
 * Upload user image.
 *
 * @param {string} userId - The ID of the user to fetched his/her profile.
 * @param {object} file - Parameters containing 'file details'.
 * @param {string} file.location - Parameters containing 'file location'.
 * @param {object} auth - req auth.
 * @returns {object} - An object with the results, including user details.
 */
exports.uploadUserimage = async (userId, { location }, auth) => {
    try {
        const findUser = await userModel.findOneAndUpdate({ _id: userId }, { image: location, updatedBy: auth._id }, { new: true });

        if (!findUser) {
            return {
                success: false,
                message: 'Error while uploading image.'
            };
        }

        return {
            success: true,
            message: `Image uploaded successfully.`,
            data: findUser
        };
    } catch (error) {
        logger.error(LOG_ID, `Error occurred during fetching user profile (uesrProfile): ${error}`);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
};