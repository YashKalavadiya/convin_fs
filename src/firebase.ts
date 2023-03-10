// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBsUyaw5scxJGQHa_9tq8toCmOdK2KvKeE",
    authDomain: "enview-app.firebaseapp.com",
    projectId: "enview-app",
    storageBucket: "enview-app.appspot.com",
    messagingSenderId: "320013328431",
    appId: "1:320013328431:web:056588cab4c858e65aa6da",
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Database = getDatabase(app);
