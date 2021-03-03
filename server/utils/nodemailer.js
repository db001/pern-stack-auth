require('dotenv').config();

const nodemailer = require('nodemailer');

const options = {
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAPUSER,
        pass: process.env.MAILTRAPPASSWORD
    }
}

const transport = nodemailer.createTransport(options);

module.exports = transport;