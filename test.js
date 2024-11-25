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

const mailOptions = {
    from: 'closed_briefing@macalesterstreet.org',     // Sender's email address
    to: 'smaxfiel@macalester.edu',                      // Recipient's email address
    subject: 'Test Email from Macalester Street',     // Email subject
    text: 'This is a test email sent using Nodemailer.', // Email body
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('Error sending email:', error);
    } else {
        console.log('Email sent successfully:', info.response);
    }
});