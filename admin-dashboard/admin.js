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
  getDocs,
  doc,
  getDoc
} from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJ6L9uvqJqV1EYa37UosNgA4fTNlSuLac",
  authDomain: "smart-attendance-system-a2fd7.firebaseapp.com",
  projectId: "smart-attendance-system-a2fd7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const subjectTable = document.getElementById("subjectTable");
const studentTable = document.getElementById("studentTable");
const lowAttendanceTable = document.getElementById("lowAttendanceTable");
const overallAttendance = document.getElementById("overallAttendance");

const departmentFilter = document.getElementById("departmentFilter");
const sectionFilter = document.getElementById("sectionFilter");

departmentFilter.onchange = loadData;
sectionFilter.onchange = loadData;

document.getElementById("logoutBtn").onclick = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    alert("Admin only");
    signOut(auth);
    return;
  }

  loadData();
});

async function loadData() {

  subjectTable.innerHTML = "";
  studentTable.innerHTML = "";
  lowAttendanceTable.innerHTML = "";

  const usersSnap = await getDocs(collection(db, "users"));
  const students = {};

  usersSnap.forEach(d => {
    const u = d.data();
    if (u.role === "student") {
      students[u.email] = {
        department: u.department,
        section: u.section
      };
    }
  });

  const attSnap = await getDocs(collection(db, "attendance"));

  const subjectMap = {};
  const studentMap = {};

  attSnap.forEach(d => {
    const a = d.data();

    if (!students[a.studentEmail]) return;

    if (!subjectMap[a.subject])
      subjectMap[a.subject] = { t: 0, p: 0 };

    subjectMap[a.subject].t++;
    if (a.status === "Present") subjectMap[a.subject].p++;

    if (!studentMap[a.studentEmail])
      studentMap[a.studentEmail] = { t: 0, p: 0 };

    studentMap[a.studentEmail].t++;
    if (a.status === "Present") studentMap[a.studentEmail].p++;
  });

  for (let s in subjectMap) {
    const v = subjectMap[s];
    subjectTable.innerHTML += `
      <tr>
        <td>${s}</td>
        <td>${v.t}</td>
        <td>${v.p}</td>
        <td>${((v.p/v.t)*100).toFixed(2)}%</td>
      </tr>`;
  }

  let total = 0, present = 0;

  for (let email in studentMap) {
    const info = students[email];
    if (!info) continue;

    if (departmentFilter.value !== "ALL" &&
        info.department !== departmentFilter.value) continue;

    if (sectionFilter.value !== "ALL" &&
        info.section !== sectionFilter.value) continue;

    const v = studentMap[email];
    const percent = (v.p/v.t)*100;

    total += v.t;
    present += v.p;

    studentTable.innerHTML += `
      <tr>
        <td>${email}</td>
        <td>${info.department}</td>
        <td>${info.section}</td>
        <td>${percent.toFixed(2)}%</td>
      </tr>`;

    if (percent < 75) {
      lowAttendanceTable.innerHTML += `
        <tr>
          <td>${email}</td>
          <td>${info.department}</td>
          <td>${info.section}</td>
          <td>${percent.toFixed(2)}%</td>
        </tr>`;
    }
  }

  overallAttendance.innerText =
    "Overall Attendance: " +
    (total ? ((present/total)*100).toFixed(2) : 0) + "%";
}
