import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCW0nUdkpgFZb0wN7Ue-kauOS2DrIDxqy0",
    authDomain: "brief-a899c.firebaseapp.com",
    databaseURL: "https://brief-a899c-default-rtdb.firebaseio.com",
    projectId: "brief-a899c",
    storageBucket: "brief-a899c.firebasestorage.app",
    messagingSenderId: "1074380539679",
    appId: "1:1074380539679:web:1d6a5c23fdf60baa53522a",
    measurementId: "G-TD8HT4BZ1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Form Submission
document.getElementById('entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Insert data into Firebase
    try {
        await push(ref(database, 'entries'), {
            name,
            email,
            timestamp: new Date().toISOString(),
        });
        alert('Entry submitted successfully!');
        document.getElementById('entry-form').reset();
    } catch (error) {
        console.error('Error submitting entry:', error);
        alert('Failed to submit entry. Check the console for details.');
    }



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
        to: email,                      // Recipient's email address
        subject: '[briefing group] -- welcome to the briefing group',     // Email subject
        text: 'Dear '+name+'\n Welcome to the Briefing Group.', // Email body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
});
