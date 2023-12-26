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
module.exports = { uploadS3 };