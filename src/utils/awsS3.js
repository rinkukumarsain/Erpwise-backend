const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

console.log({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_BUCKET_REGION,
    bucket: process.env.AWS_S3_BUCKET_NAME
});

/**
 * Configuration object for AWS SDK.
 *
 * @type {{accessKeyId: string, secretAccessKey: string, region: string}}
 */
const awsConfig = {
    accessKeyId: process.env.AWS_S3_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET,
    region: process.env.AWS_S3_BUCKET_REGION
};

// Update AWS SDK configuration
AWS.config.update(awsConfig);

/**
 * AWS S3 instance for interacting with the S3 service.
 *
 * @type {AWS.S3}
 */
exports.s3 = new AWS.S3();