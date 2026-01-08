import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAJ6L9uvqJqV1EYa37UosNgA4fTNlSuLac",
  authDomain: "smart-attendance-system-a2fd7.firebaseapp.com",
  projectId: "smart-attendance-system-a2fd7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("loginBtn").onclick = login;

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // 🔎 Fetch role
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      alert("User role not assigned");
      return;
    }

    const role = userDoc.data().role;

    // 🔀 Redirect based on role
    if (role === "student") {
      window.location.href = "/student-dashboard/student.html";
    } else if (role === "staff") {
      window.location.href = "/staff-dashboard/staff-dashboard.html";
    } else if (role === "hod") {
      window.location.href = "/hod-dashboard/hod.html";
    } else if (role === "admin") {
      window.location.href = "/admin-dashboard/admin.html";
    } else {
      alert("Invalid role");
    }

  } catch (err) {
    document.getElementById("error").innerText = err.message;
  }
}
