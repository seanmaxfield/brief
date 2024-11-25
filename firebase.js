import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
