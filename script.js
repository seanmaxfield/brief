import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
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
const db = getDatabase(app);

// Function to handle form submission
const handleFormSubmit = (formId, type) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(form);
        const data = { type }; // Add submission type (signup or article)
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            // Push data to Firebase Realtime Database
            await push(ref(db, type === "signup" ? "emailList" : "articles"), data);

            // Display success message and reset form
            alert(`${type === "signup" ? "Signup" : "Article"} submitted successfully!`);
            form.reset();
        } catch (error) {
            console.error(`Error submitting ${type}:`, error);
            alert(`Failed to submit ${type}. Please try again.`);
        }
    });
};

// Attach form submission handlers
document.addEventListener("DOMContentLoaded", () => {
    handleFormSubmit("signupForm", "signup"); // Handles signup form
    handleFormSubmit("articleForm", "article"); // Handles article form
});
