// const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Local Import
const { s3 } = require('./awsS3');

/**
 * Multer storage configuration for S3.
 *
 * @type {multer.Multer}
 */
const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        ACL: 'public-read', // Access Control List

        /**
         * Function to generate metadata for the S3 object.
         *
         * @param {object} req - The Express request object.
         * @param {object} file - The uploaded file.
         * @param {Function} cb - The callback function.
         */
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },

        /**
         * Function to generate the key (filename) for the S3 object.
         *
         * @param {object} req - The Express request object.
         * @param {object} file - The uploaded file.
         * @param {Function} cb - The callback function.
         */
        key: function (req, file, cb) {
            let exe = file.originalname.split('.').pop();
            let folderName = req.query.type || 'image';
            let filename = `${folderName}/${Math.floor(Math.random() * 10000)}${Date.now()}.${exe}`;
            cb(null, filename);
        }

    })

});

/**
 * Multer storage configuration for file uploads.
 *
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
    /**
     * Function to determine the destination folder for file uploads.
     *
     * @param {Request} req - The Express request object.
     * @param {File} file - The file object received from the client.
     * @param {Function} cb - The callback function to indicate the destination folder.
     */
    destination: function (req, file, cb) {
        // Specify the destination folder for file uploads.
        cb(null, 'public');
    },

    /**
     * Function to determine the filename for the uploaded file.
     *
     * @param {Request} req - The Express request object.
     * @param {File} file - The file object received from the client.
     * @param {Function} cb - The callback function to indicate the filename.
     */
    filename: function (req, file, cb) {
        // Extract the file extension from the original filename.
        let exe = file.originalname.split('.').pop();

        // Generate a unique filename with a random number and timestamp.
        let filename = `${Math.floor(Math.random() * 10000)}${Date.now()}.${exe}`;

        // Return the generated filename to the callback.
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

module.exports = { uploadS3, upload };