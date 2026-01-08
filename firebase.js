// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJ6L9uvqJqV1EYa37UosNgA4fTNlSuLac",
  authDomain: "smart-attendance-system-a2fd7.firebaseapp.com",
  projectId: "smart-attendance-system-a2fd7",
  storageBucket: "smart-attendance-system-a2fd7.firebasestorage.app",
  messagingSenderId: "530971963646",
  appId: "1:530971963646:web:b31774f29c10f6a18d35af",
  measurementId: "G-CZBG8J15NC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);