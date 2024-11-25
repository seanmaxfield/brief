const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { mailConfig } = require('./config');

admin.initializeApp();

const db = admin.database();
const emailListRef = db.ref('emailList');
const articlesRef = db.ref('articles');

const transporter = nodemailer.createTransport(mailConfig);

exports.handleFormSubmission = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { type, ...data } = req.body;

    if (!type || (type !== 'signup' && type !== 'article')) {
        return res.status(400).send('Invalid submission type');
    }

    try {
        if (type === 'signup') {
            await handleSignup(data, res);
        } else if (type === 'article') {
            await handleArticleSubmission(data, res);
        }
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function handleSignup({ name, email, affiliation }, res) {
    if (!name || !email || !affiliation) {
        return res.status(400).send('Missing required fields');
    }

    const newUser = { name, email, affiliation, status: 'approved' };

    await emailListRef.push(newUser);

    await transporter.sendMail({
        from: mailConfig.auth.user,
        to: email,
        subject: '[Briefing Group] Welcome to the Email List',
        text: `Hello ${name},\n\nWelcome to the Briefing Group! You have been successfully added to the email list.\n\nBest regards,\nThe Briefing Group Team`,
    });

    res.status(200).send('Signup successful and welcome email sent.');
}

async function handleArticleSubmission({ title, author, email, description, articleText }, res) {
    if (!title || !author || !email || !description || !articleText) {
        return res.status(400).send('Missing required fields');
    }

    const newArticle = { title, author, email, description, articleText };

    await articlesRef.push(newArticle);

    const emailListSnapshot = await emailListRef.once('value');
    const emailList = emailListSnapshot.val();

    if (!emailList) {
        return res.status(200).send('No approved users to notify.');
    }

    const approvedUsers = Object.values(emailList).filter(user => user.status === 'approved');
    const recipientEmails = approvedUsers.map(user => user.email);

    if (recipientEmails.length === 0) {
        return res.status(200).send('No approved users to notify.');
    }

    const emailContent = `
        <h1>${title}</h1>
        <p><strong>Author:</strong> ${author}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p>${articleText}</p>
    `;

    await transporter.sendMail({
        from: mailConfig.auth.user,
        to: recipientEmails.join(','),
        subject: `[Briefing Group] New Article: ${title}`,
        html: emailContent,
    });

    res.status(200).send('Article submitted and email sent to approved users.');
}
