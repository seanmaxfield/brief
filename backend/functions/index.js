const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

const db = admin.database();
const emailListRef = db.ref('emailList');
const approvalIndexRef = db.ref('approvalIndex');

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

    // Fetch the current email list
    const emailListSnapshot = await emailListRef.once('value');
    const emailList = emailListSnapshot.val() || {};

    // Check if this is the first user
    const approvedUsers = Object.values(emailList).filter(user => user.status === 'approved');

    if (approvedUsers.length === 0) {
        // First user: automatically approve
        await snapshot.ref.update({ ...newUser, status: 'approved' });

        // Send welcome email
        await sendWelcomeEmail(newUser);
    } else {
        // Add the user as pending and request approval
        await snapshot.ref.update({ ...newUser, status: 'pending' });

        // Rotate approvers
        const approvalIndexSnapshot = await approvalIndexRef.once('value');
        const approvalIndex = approvalIndexSnapshot.val()?.lastApproverIndex || 0;

        const approvers = Object.values(emailList).filter(user => user.status === 'approved');
        const approver = approvers[approvalIndex % approvers.length];

        // Send approval email
        await sendApprovalRequest(approver, newUser);

        // Update the approval index for the next request
        await approvalIndexRef.set({ lastApproverIndex: (approvalIndex + 1) % approvers.length });
    }
});

// Helper: Send welcome email
async function sendWelcomeEmail(user) {
    try {
        await transporter.sendMail({
            from: 'closed_briefing@macalesterstreet.org',
            to: user.email,
            subject: '[briefing group] Welcome to the Briefing Group',
            text: `Hello ${user.name},\n\nYou have been successfully added to the email list.`,
        });
        console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}

// Helper: Send approval request email
async function sendApprovalRequest(approver, pendingUser) {
    try {
        await transporter.sendMail({
            from: 'closed_briefing@macalesterstreet.org',
            to: approver.email,
            subject: 'Approval Request',
            text: `Hello ${approver.name},\n\nA new user (${pendingUser.name}, ${pendingUser.email}) has requested to join the email list. Reply to this email with "approved" to approve the request.`,
        });
        console.log(`Approval request sent to ${approver.email}`);
    } catch (error) {
        console.error('Error sending approval request email:', error);
    }
}

// Listen for email replies
exports.processApprovalReply = functions.https.onRequest(async (req, res) => {
    const { from, text } = req.body;

    // Check if the email contains "approved"
    if (text.toLowerCase().includes('approved')) {
        // Find the pending user
        const emailListSnapshot = await emailListRef.once('value');
        const emailList = emailListSnapshot.val();

        const pendingUserKey = Object.keys(emailList).find(key => emailList[key].status === 'pending');
        if (pendingUserKey) {
            const pendingUser = emailList[pendingUserKey];

            // Approve the user
            await db.ref(`emailList/${pendingUserKey}`).update({ status: 'approved' });

            // Send welcome email
            await sendWelcomeEmail(pendingUser);

            res.status(200).send(`User ${pendingUser.name} has been approved and notified.`);
        } else {
            res.status(404).send('No pending user found.');
        }
    } else {
        res.status(400).send('Invalid approval email.');
    }
});
