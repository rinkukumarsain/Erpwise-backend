const { Joi } = require('express-validation');

exports.login = {
    body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    })
};