const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { mailConfig } = require('./config');
const cors = require('cors')({ origin: true });

admin.initializeApp();

const db = admin.database();
const emailListRef = db.ref('emailList');
const articlesRef = db.ref('articles');

const transporter = nodemailer.createTransport(mailConfig);

// Handle Form Submissions
exports.handleFormSubmission = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { type, ...data } = req.body;

        if (!type || (type !== 'signup' && type !== 'article')) {
            return res.status(400).send('Invalid submission type.');
        }

        try {
            if (type === 'signup') {
                await handleSignup(data, res);
            } else if (type === 'article') {
                await handleArticleSubmission(data, res);
            }
        } catch (error) {
            console.error('Error processing submission:', error);
            res.status(500).send('Internal server error.');
        }
    });
});

// Handle Signup
async function handleSignup({ name, email, affiliation }, res) {
    if (!name || !email || !affiliation) {
        return res.status(400).send('Missing required fields.');
    }

    const newUser = { name, email, affiliation, status: 'pending' };
    const snapshot = await emailListRef.push(newUser);

    // Rotate approver
    const approver = await getNextApprover();
    await sendApprovalRequest(approver, {
        type: 'signup',
        data: { ...newUser, id: snapshot.key },
    });

    res.status(200).send('Signup request submitted for approval.');
}

// Handle Article Submission
async function handleArticleSubmission({ title, author, email, description, articleText }, res) {
    if (!title || !author || !email || !description || !articleText) {
        return res.status(400).send('Missing required fields.');
    }

    const newArticle = { title, author, email, description, articleText, status: 'pending' };
    const snapshot = await articlesRef.push(newArticle);

    // Rotate approver
    const approver = await getNextApprover();
    await sendApprovalRequest(approver, {
        type: 'article',
        data: { ...newArticle, id: snapshot.key },
    });

    res.status(200).send('Article submitted for approval.');
}

// Get Next Approver
async function getNextApprover() {
    const emailListSnapshot = await emailListRef.once('value');
    const emailList = emailListSnapshot.val();

    const approvedUsers = Object.values(emailList).filter(user => user.status === 'approved');
    if (approvedUsers.length === 0) {
        throw new Error('No approved users available to approve requests.');
    }

    const approver = approvedUsers[Math.floor(Math.random() * approvedUsers.length)];
    return approver;
}

// Send Approval Request Email
async function sendApprovalRequest(approver, request) {
    const { type, data } = request;

    const subject = type === 'signup'
        ? 'Approval Request: New Email List Signup'
        : 'Approval Request: New Article Submission';

    const content = type === 'signup'
        ? `Approve the following new email list signup:\n\nName: ${data.name}\nEmail: ${data.email}\nAffiliation: ${data.affiliation}\n\nReply with "approved" to approve.`
        : `Approve the following new article submission:\n\nTitle: ${data.title}\nAuthor: ${data.author}\nDescription: ${data.description}\n\nReply with "approved" to approve.`;

    await transporter.sendMail({
        from: mailConfig.auth.user,
        to: approver.email,
        subject,
        text: content,
    });
}
