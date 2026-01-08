import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAJ6L9uvqJqV1EYa37UosNgA4fTNlSuLac",
  authDomain: "smart-attendance-system-a2fd7.firebaseapp.com",
  projectId: "smart-attendance-system-a2fd7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ELEMENTS
const subjectTable = document.getElementById("subjectTable");
const overallAttendance = document.getElementById("overallAttendance");

document.getElementById("logoutBtn").onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "/login.html";
  });
};

// AUTH CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  document.getElementById("studentEmail").innerText = user.email;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const student = userSnap.data();

  document.getElementById("studentInfo").innerText =
    `${student.department} - Section ${student.section}`;

  loadAttendance(user.email);
});

// LOAD ATTENDANCE
async function loadAttendance(email) {
  const q = query(
    collection(db, "attendance"),
    where("studentEmail", "==", email)
  );

  const snapshot = await getDocs(q);

  let subjectMap = {};
  let total = 0, present = 0;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    if (!subjectMap[data.subject]) {
      subjectMap[data.subject] = { total: 0, present: 0 };
    }

    subjectMap[data.subject].total++;
    total++;

    if (data.status === "Present") {
      subjectMap[data.subject].present++;
      present++;
    }
  });

  subjectTable.innerHTML = "";

  for (let subject in subjectMap) {
    const s = subjectMap[subject];
    const percent = ((s.present / s.total) * 100).toFixed(2);

    subjectTable.innerHTML += `
      <tr>
        <td>${subject}</td>
        <td>${s.total}</td>
        <td>${s.present}</td>
        <td>${percent}%</td>
      </tr>
    `;
  }

  overallAttendance.innerText =
    total > 0 ? ((present / total) * 100).toFixed(2) + "%" : "0%";
}
