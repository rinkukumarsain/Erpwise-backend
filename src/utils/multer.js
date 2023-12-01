const multer = require('multer');

/**
 * Multer storage configuration.
 *
 * @type {multer.DiskStorageEngine}
 */
const storage = multer.diskStorage({
    /**
     * Destination function for storing files.
     *
     * @param {object} req - The Express request object.
     * @param {object} file - The uploaded file.
     * @param {Function} cb - The callback function.
     */
    destination: function (req, file, cb) {
        console.log('multer-----------------', req.body);
        cb(null, `public/${req.body.typename}`);
    },

    /**
     * Filename function for naming stored files.
     *
     * @param {object} req - The Express request object.
     * @param {object} file - The uploaded file.
     * @param {Function} cb - The callback function.
     */
    filename: function (req, file, cb) {
        let exe = file.originalname.split('.').pop();
        let filename = `/${Date.now()}.${exe}`;
        cb(null, filename);
    }
});

/**
 * Multer upload middleware configuration.
 *
 * @type {multer.Multer}
 */
const upload = multer({
    storage: storage
    // Add fileFilter if needed
});

module.exports = upload;