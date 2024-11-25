const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

const db = admin.database();
const emailListRef = db.ref('emailList');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
    },
});

// On new email list signup
exports.handleNewSignup = functions.database.ref('/emailList/{pushId}').onCreate(async (snapshot) => {
    const newUser = snapshot.val();
    const emailListSnapshot = await emailListRef.once('value');
    const emailList = emailListSnapshot.val();

    if (!emailList || Object.keys(emailList).length === 1) {
        newUser.status = 'approved';
        await snapshot.ref.update(newUser);

        // Send confirmation email
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to: newUser.email,
            subject: 'Welcome to the Briefing Group!',
            text: `Hello ${newUser.name},\n\nYou have been successfully added to the email list.`,
        });
    } else {
        const approver = getNextApprover(emailList);
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to: approver.email,
            subject: 'Approval Request',
            text: `Approve the new signup for ${newUser.name} (${newUser.email})? Reply with "approved".`,
        });
    }
});

// Helper function to get the next approver
function getNextApprover(emailList) {
    const approved = Object.values(emailList).filter(user => user.status === 'approved');
    return approved[Math.floor(Math.random() * approved.length)];
}
