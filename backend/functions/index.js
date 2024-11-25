const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const db = admin.database();
const emailListRef = db.ref('emailList');
const articlesRef = db.ref('articles');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: 'mail.macalesterstreet.org',
    port: 465,
    secure: true,
    auth: {
        user: 'closed_briefing@macalesterstreet.org',
        pass: 'Macalester20',
    },
});

// Function: Send Welcome Email
exports.handleNewSignup = functions.database.ref('/emailList/{pushId}').onCreate(async (snapshot) => {
    const newUser = snapshot.val();

    // Update user's status to approved
    await snapshot.ref.update({ ...newUser, status: 'approved' });

    // Send Welcome Email
    try {
        await transporter.sendMail({
            from: 'closed_briefing@macalesterstreet.org',
            to: newUser.email,
            subject: '[Briefing Group] Welcome to the Email List',
            text: `Hello ${newUser.name},\n\nWelcome to the Briefing Group! You have been successfully added to the email list.\n\nBest regards,\nThe Briefing Group Team`,
        });
        console.log(`Welcome email sent to ${newUser.email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
});

// Function: Send Article Email
exports.onNewArticle = functions.database.ref('/articles/{pushId}').onCreate(async (snapshot) => {
    const article = snapshot.val();

    // Fetch all approved users
    const emailListSnapshot = await emailListRef.once('value');
    const emailList = emailListSnapshot.val();

    if (!emailList) {
        console.log('No approved users found.');
        return;
    }

    // Filter approved users
    const approvedUsers = Object.values(emailList).filter(user => user.status === 'approved');
    const recipientEmails = approvedUsers.map(user => user.email);

    if (recipientEmails.length === 0) {
        console.log('No approved users to send the article to.');
        return;
    }

    // Prepare email content
    const emailContent = `
        <h1>${article.title}</h1>
        <p><strong>Author:</strong> ${article.author}</p>
        <p><strong>Description:</strong> ${article.description}</p>
        <p>${article.articleText}</p>
    `;

    try {
        // Send email to all approved users
        await transporter.sendMail({
            from: 'closed_briefing@macalesterstreet.org',
            to: recipientEmails.join(','),
            subject: `[Briefing Group] New Article: ${article.title}`,
            html: emailContent,
        });
        console.log(`Article "${article.title}" emailed to approved users.`);
    } catch (error) {
        console.error('Error sending article email:', error);
    }
});
