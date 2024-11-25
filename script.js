import { db } from './firebase.js';
import { ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    // Handle Article Submission
    const articleForm = document.getElementById('articleForm');
    if (articleForm) {
        articleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const article = {
                title: e.target.title.value,
                author: e.target.author.value,
                email: e.target.email.value,
                description: e.target.description.value,
                articleText: e.target.articleText.value
            };
            // Push the article to the database
            push(ref(db, 'articles'), article)
                .then(() => {
                    alert('Article submitted successfully!');
                    e.target.reset();
                })
                .catch((error) => {
                    console.error('Error submitting article:', error);
                    alert('Failed to submit the article.');
                });
        });
    }

    // Handle Email List Signup
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUser = {
                name: e.target.name.value,
                email: e.target.email.value,
                affiliation: e.target.affiliation.value,
                status: "approved" // Automatically approve the user
            };
            push(ref(db, 'emailList'), newUser)
                .then(() => {
                    alert('Signup request submitted successfully!');
                    e.target.reset();
                })
                .catch((error) => {
                    console.error('Error signing up user:', error);
                    alert('Failed to sign up.');
                });
        });
    }
});
