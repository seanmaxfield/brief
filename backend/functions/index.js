const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const db = admin.database();
const emailListRef = db.ref('emailList');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    host: 'mail.macalesterstreet.org',
    port: 465,
    secure: true,
    auth: {
        user: 'closed_briefing@macalesterstreet.org',
        pass: 'Macalester20',
    },
});

// On new email list signup
exports.handleNewSignup = functions.database.ref('/emailList/{pushId}').onCreate(async (snapshot) => {
    const newUser = snapshot.val();

    // Update the user's status to approved
    await snapshot.ref.update({ ...newUser, status: 'approved' });

    // Send a welcome email
    try {
        await transporter.sendMail({
            from: 'closed_briefing@macalesterstreet.org',
            to: newUser.email,
            subject: '[briefing group] Welcome to the Briefing Group',
            text: `Hello ${newUser.name},\n\nWelcome to the Briefing Group! You have been successfully added to the email list.\n\nBest regards,\nThe Briefing Group Team`,
        });
        console.log(`Welcome email sent to ${newUser.email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
});
