import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔹 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAJ6L9uvqJqV1EYa37UosNgA4fTNlSuLac",
  authDomain: "smart-attendance-system-a2fd7.firebaseapp.com",
  projectId: "smart-attendance-system-a2fd7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* 🔹 ELEMENTS */
const sectionSelect = document.getElementById("section");
const studentList = document.getElementById("studentList");

let STAFF_DEPT = "";
let STAFF_SECTIONS = [];

/* 🔹 AUTH */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  const staffRef = doc(db, "users", user.uid);
  const snap = await getDoc(staffRef);
  const data = snap.data();

  document.getElementById("staffEmail").innerText = user.email;
  document.getElementById("staffDept").innerText =
    "Department: " + data.department;

  STAFF_DEPT = data.department;
  STAFF_SECTIONS = data.section.split(",");

  document.getElementById("staffSections").innerText =
    "Sections: " + STAFF_SECTIONS.join(", ");

  /* LOAD SECTIONS */
  sectionSelect.innerHTML = `<option value="">Select Section</option>`;
  STAFF_SECTIONS.forEach(sec => {
    const opt = document.createElement("option");
    opt.value = sec.trim();
    opt.textContent = sec.trim();
    sectionSelect.appendChild(opt);
  });
});

/* 🔹 LOAD STUDENTS */
sectionSelect.addEventListener("change", loadStudents);

async function loadStudents() {
  const section = sectionSelect.value;
  studentList.innerHTML = "";

  if (!section) {
    studentList.innerHTML = "<p class='muted'>Select section</p>";
    return;
  }

  const q = query(
    collection(db, "users"),
    where("role", "==", "student"),
    where("department", "==", STAFF_DEPT),
    where("section", "==", section)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    studentList.innerHTML = "<p class='muted'>No students found</p>";
    return;
  }

  snap.forEach(docSnap => {
    const s = docSnap.data();
    studentList.innerHTML += `
      <div class="student-item">
        <span>${s.email}</span>
        <input type="checkbox" value="${s.email}">
      </div>
    `;
  });
}

/* 🔹 SUBMIT ATTENDANCE */
document.getElementById("submitAttendance").onclick = async () => {
  const date = document.getElementById("date").value;
  const subject = document.getElementById("subject").value;
  const section = sectionSelect.value;

  if (!date || !section || !subject) {
    alert("Select date, subject and section");
    return;
  }

  const checkboxes = document.querySelectorAll(
    "#studentList input[type='checkbox']"
  );

  for (let cb of checkboxes) {
    await addDoc(collection(db, "attendance"), {
      studentEmail: cb.value,
      department: STAFF_DEPT,
      section,
      subject,
      status: cb.checked ? "Present" : "Absent",
      date // ✅ SAVE AS STRING (IMPORTANT)
    });
  }

  alert("Attendance submitted successfully");
};

/* 🔹 EXPORT TO EXCEL */
document.getElementById("exportExcel").addEventListener("click", exportToExcel);

function exportToExcel() {
  const date = document.getElementById("date").value;
  const subject = document.getElementById("subject").value;
  const section = sectionSelect.value;

  if (!date || !subject || !section) {
    alert("Please select Date, Subject and Section");
    return;
  }

  const checkboxes = document.querySelectorAll(
    "#studentList input[type='checkbox']"
  );

  if (checkboxes.length === 0) {
    alert("No students loaded");
    return;
  }

  const excelData = [
    ["Date", date],
    ["Subject", subject],
    ["Section", section],
    [],
    ["Student Email", "Status"]
  ];

  checkboxes.forEach(cb => {
    excelData.push([
      cb.value,                       // ✅ FIXED
      cb.checked ? "Present" : "Absent"
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  XLSX.writeFile(workbook,
    `Attendance_${subject}_${section}_${date}.xlsx`
  );
}

/* 🔹 LOGOUT */
document.getElementById("logoutBtn").onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "../login.html";
  });
};
