const bcrypt = require('bcryptjs');

// Local Import
const { userModel } = require('../dbModel');
const { userDao } = require('../dao');
const { generateAuthToken } = require('../utils/tokenGenerator');
const { roleAccess } = require('../../config/default.json');
const { query } = require('../utils/mongodbQuery');
const { logger } = require('../utils/logger');

const LOG_ID = 'services/userServices';

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

        const { data: userData } = await this.uesrProfile({ userId: findUser._id });

        // Generate a JWT token for the user.
        const token = generateAuthToken({
            userId: findUser._id,
            name: userData.name,
            email: userData.email,
            role: userData.role
        });

        await userModel.updateOne({ _id: findUser._id }, { token });
        // const resData = await this.uesrProfile({ userId: findUser._id });
        userData.menuList = roleAccess[userData.role];
        return {
            success: true,
            message: 'You have successfully logged in to your account',
            data: userData,
            token
        };
    } catch (error) {
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
        // const findUser = await userModel.findOne({ _id: userId, status: userStatus.active }, { password: 0 });
        const findUser = await query.aggregation(userModel, userDao.userProfilePipeline(userId));

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