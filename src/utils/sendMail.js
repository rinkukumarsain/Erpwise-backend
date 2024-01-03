const nodemailer = require('nodemailer');
const { logger } = require('./logger');

/**
 * Sends an email using Nodemailer.
 *
 * @param {object} userData - User data containing email configuration.
 * @param {object} mailData - Mail data with details like recipients, subject, text, and html.
 * @returns {Promise<object>} - A Promise that resolves with the result of the email sending operation.
 */
exports.sendMail = async (userData, mailData) => {
    try {
        // Create a reusable transporter object using the provided SMTP transport details.
        let transporter = nodemailer.createTransport({
            host: userData.host,
            port: userData.port,
            secure: userData.secure, // true for 465, false for other ports
            auth: {
                user: userData.email,
                pass: userData.password
            }
        });

        // Configure the email message.
        const emailOptions = {
            from: mailData.from,
            to: mailData.to,
            subject: mailData.subject,
            text: mailData.text,
            html: mailData.html,
            cc: mailData.cc,
            attachments: mailData.attachments
        };

        // Use the transporter to send the email.
        const result = await transporter.sendMail(emailOptions);

        return result;
    } catch (error) {
        // Log any errors that occur during the email sending process.
        logger.error(`Error sending email: ${error.message}`);
        // Propagate the error for further handling, if needed.
        throw error;
    }
};
