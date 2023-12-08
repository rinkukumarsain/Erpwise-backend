const mongo = require('mongoose');

mongo.connect('mongodb://127.0.0.1:27017')
    .then(() => {
        console.log('Database connected successfully!!');
    }).catch(() => {
        console.log('Error while connecting to database!!');
    });