const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {object} User
 * @property {string} name - The name of the user.
 * @property {string} [image] - URL or path to the user's image.
 * @property {string} employeeId - The employee ID (must be unique).
 * @property {string} email - The email address of the user (must be unique).
 * @property {string} [mobile] - The mobile number of the user.
 * @property {string} password - The password of the user.
 * @property {string} [role=user] - The role of the user (default is 'user').
 * @property {mongoose.Types.ObjectId} [createdBy] - The ID of the user who created this user.
 * @property {mongoose.Types.ObjectId} [updatedBy] - The ID of the user who last updated this user.
 * @property {mongoose.Types.ObjectId} baseCurrency - The ID of the base currency (required).
 * @property {mongoose.Types.ObjectId} organisationId - The ID of the organisation to which the user belongs (required).
 * @property {boolean} [isActive=true] - Indicates whether the user is active (default is true).
 * @property {string} [token] - Authentication token associated with the user (default is empty string).
 * @property {string} [jobTitle] - The job title of the user (default is an empty string).
 * @property {Date} createdAt - The timestamp when the user was created.
 * @property {Date} updatedAt - The timestamp when the user was last updated.
 */

/**
 * Mongoose schema for user.
 *
 * @type {mongoose.Schema<User>}
 */
const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ''
        },
        employeeId: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        mobile: {
            type: String,
            default: ''
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            default: 'user'
        },
        createdBy: {
            type: mongoose.Types.ObjectId
        },
        updatedBy: {
            type: mongoose.Types.ObjectId
        },
        baseCurrency: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        organisationId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        token: {
            type: String,
            default: ''
        },
        jobTitle: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('User', userSchema);
