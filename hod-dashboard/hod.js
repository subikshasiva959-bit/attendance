import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
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

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ELEMENTS
const subjectTable = document.getElementById("subjectTable");
const allStudentsTable = document.getElementById("allStudentsTable");
const lowAttendanceTable = document.getElementById("lowAttendanceTable");
const sectionFilter = document.getElementById("sectionFilter");
const overallAttendance = document.getElementById("overallAttendance");

let HOD_DEPARTMENT = "";

// LOGOUT
document.getElementById("logoutBtn").onclick = () => {
  signOut(auth).then(() => window.location.href = "/login.html");
};

// AUTH CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    signOut(auth);
    return;
  }

  const hod = snap.data();
  if (hod.role !== "hod") {
    signOut(auth);
    return;
  }

  HOD_DEPARTMENT = hod.department;

  document.getElementById("hodEmail").innerText = user.email;
  document.getElementById("hodDept").innerText =
    `Department: ${HOD_DEPARTMENT}`;

  loadAnalytics();
});

// SECTION FILTER
sectionFilter.addEventListener("change", loadAnalytics);

// LOAD ANALYTICS
async function loadAnalytics() {
  subjectTable.innerHTML = "";
  allStudentsTable.innerHTML = "";
  lowAttendanceTable.innerHTML = "";

  const selectedSection = sectionFilter.value;
  const snap = await getDocs(collection(db, "attendance"));

  let subjectMap = {};
  let studentMap = {};
  let total = 0, present = 0;

  snap.forEach(docSnap => {
    const data = docSnap.data();

    // ✅ FILTER BY DEPARTMENT
    if (data.department !== HOD_DEPARTMENT) return;

    // ✅ FILTER BY SECTION
    if (selectedSection !== "ALL" && data.section !== selectedSection) return;

    // SUBJECT
    if (!subjectMap[data.subject]) {
      subjectMap[data.subject] = { total: 0, present: 0 };
    }
    subjectMap[data.subject].total++;
    total++;

    if (data.status === "Present") {
      subjectMap[data.subject].present++;
      present++;
    }

    // STUDENT
    if (!studentMap[data.studentEmail]) {
      studentMap[data.studentEmail] = { total: 0, present: 0 };
    }
    studentMap[data.studentEmail].total++;
    if (data.status === "Present") {
      studentMap[data.studentEmail].present++;
    }
  });

  // SUBJECT TABLE
  for (let subject in subjectMap) {
    const s = subjectMap[subject];
    subjectTable.innerHTML += `
      <tr>
        <td>${subject}</td>
        <td>${s.total}</td>
        <td>${s.present}</td>
        <td>${((s.present / s.total) * 100).toFixed(2)}%</td>
      </tr>
    `;
  }

  // STUDENT TABLES
  for (let student in studentMap) {
    const s = studentMap[student];
    const percent = (s.present / s.total) * 100;

    // ALL STUDENTS
    allStudentsTable.innerHTML += `
      <tr>
        <td>${student}</td>
        <td>${percent.toFixed(2)}%</td>
      </tr>
    `;

    // LOW ATTENDANCE
    if (percent < 75) {
      lowAttendanceTable.innerHTML += `
        <tr class="danger">
          <td>${student}</td>
          <td>${percent.toFixed(2)}%</td>
        </tr>
      `;
    }
  }

  overallAttendance.innerText =
    `Overall Attendance: ${
      total ? ((present / total) * 100).toFixed(2) : 0
    }%`;
}
