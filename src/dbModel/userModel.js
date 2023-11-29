const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User schema for MongoDB.
 *
 * @typedef {object} User
 * @property {string} name - The name of the user.
 * @property {string} employeeId - The unique username of the user.
 * @property {string} email - The unique email of the user.
 * @property {string} phone - The user's phone number.
 * @property {string} password - The user's password.
 * @property {string} role - The user's role (default is 'user').
 * @property {string} desc - Additional user description.
 * @property {mongoose.Types.ObjectId} createdBy - The ID of the user who created this user.
 * @property {mongoose.Types.ObjectId} updatedBy - The ID of the user who updated this user.
 * @property {string} isActive - The user's status (default is true).
 */
const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
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
        isActive: {
            type: Boolean,
            default: true
        },
        token: {
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