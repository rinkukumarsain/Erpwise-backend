const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema(
    {
        fileName: {
            type: String,
            required: true
        },
        fileUrl: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const MailLogSchema = new Schema(
    {
        from: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        },
        cc: {
            type: String,
            default: null
        },
        subject: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        documents: [documentSchema],
        mailDetails: {
            type: Object
        },
        nodemailerResponse: {
            type: Object
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('maillog', MailLogSchema);