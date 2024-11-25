const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'mail.macalesterstreet.org', // Outgoing SMTP server
    port: 465,                         // SMTP Port (465 for SSL)
    secure: true,                      // Use SSL/TLS
    auth: {
        user: 'closed_briefing@macalesterstreet.org', // Email address
        pass: 'Macalester20',                 // Email account's password
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Server is ready to take messages:', success);
    }
});