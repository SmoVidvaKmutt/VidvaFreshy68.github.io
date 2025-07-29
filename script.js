
const firebaseConfig = {
  apiKey: "AIzaSyDsIOXsXLQYtIplfZxBJOfZMDERLZ1JV4k",
  authDomain: "smovidvafreshy68.firebaseapp.com",
  projectId: "smovidvafreshy68",
  storageBucket: "smovidvafreshy68.firebasestorage.app",
  messagingSenderId: "230035888212",
  appId: "1:230035888212:web:b403cac8fb2f98eb4bb5c1",
  measurementId: "G-D3KPBVTBQD"
};

// --- ไม่ต้องแก้ไขโค้ดด้านล่างนี้ ---

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const studentsCollection = collection(db, "students");

// --- Search Function (Queries Firestore) ---
async function performSearch() {
    const rawQuery = document.getElementById('query').value.trim();
    if (!rawQuery) {
        alert("กรุณากรอกข้อมูลเพื่อค้นหา (รหัสนักศึกษา, ชื่อ หรือเบอร์โทรศัพท์)");
        return;
    }

    const cleanQuery = rawQuery.replace(/\s/g, '');
    const lowerCaseQuery = cleanQuery.toLowerCase();
    
    // แสดงสถานะกำลังโหลด
    const container = document.getElementById('results-container');
    container.innerHTML = '<div class="result"><p>กำลังค้นหา...</p></div>';

    try {
        // [แก้ไข] Firestore ไม่รองรับการค้นหาแบบ OR ในหลายฟิลด์โดยตรง
        // เราจึงต้อง Query แยกกันแล้วนำผลลัพธ์มารวมกัน
        
        // Query ด้วยรหัสนักศึกษา
        const idQuery = query(studentsCollection, where("records.student_id", "array-contains", cleanQuery));
        
        // Query ด้วยเบอร์โทรศัพท์ (ทั้งแบบมีและไม่มี 0 นำหน้า)
        const phoneWithZero = '0' + (cleanQuery.startsWith('0') ? cleanQuery.substring(1) : cleanQuery);
        const phoneWithoutZero = cleanQuery.startsWith('0') ? cleanQuery.substring(1) : cleanQuery;
        const phoneQuery = query(studentsCollection, where("records.phone", "array-contains-any", [phoneWithZero, phoneWithoutZero]));

        // ดึงข้อมูลจาก Firestore
        const idSnapshot = await getDocs(idQuery);
        const phoneSnapshot = await getDocs(phoneQuery);

        let results = [];
        // [แก้ไข] ดึงข้อมูลจาก field 'records'
        idSnapshot.forEach(doc => results.push(...doc.data().records));
        phoneSnapshot.forEach(doc => results.push(...doc.data().records));

        // (การค้นหาด้วยชื่อเต็มๆ จะช้าและมีค่าใช้จ่ายสูงใน Firestore จึงแนะนำให้ใช้ 2 วิธีก่อน)

        // กรองข้อมูลที่ซ้ำกันออก (กรณีที่เจอจากทั้งรหัสและเบอร์)
        const uniqueResults = Array.from(new Map(results.map(item => [item.student_id, item])).values());

        // กรองอีกครั้งเพื่อให้แน่ใจว่าผลลัพธ์ตรงกับคำค้นหา
        const finalResults = uniqueResults.filter(student => {
            const studentId = String(student.student_id).replace(/\s/g, '');
            const fullName = (`${student.first_name}${student.last_name}`).toLowerCase().replace(/\s/g, '');
            const dataPhoneNumber = String(student.phone).replace(/\s/g, '');
            const coreDataPhone = dataPhoneNumber.startsWith('0') ? dataPhoneNumber.substring(1) : dataPhoneNumber;
            const coreQueryPhone = cleanQuery.startsWith('0') ? cleanQuery.substring(1) : cleanQuery;

            return studentId === cleanQuery || fullName === lowerCaseQuery || coreDataPhone === coreQueryPhone;
        });

        showResults(finalResults);

    } catch (error) {
        console.error("Error searching data: ", error);
        container.innerHTML = '<div class="result"><p>เกิดข้อผิดพลาดในการค้นหา</p></div>';
    }
}

// --- Display Results Function (No changes needed) ---
function showResults(data) {
    const container = document.getElementById('results-container');
    
    if (data.length === 0) {
        container.innerHTML = '<div class="result"><p>ไม่พบข้อมูล</p></div>';
        return;
    }

    const resultsHtml = data.map(item => `
        <div class="result">
            <p style="font-size: 22px; font-weight: bold; color: #FFD700; margin-bottom: 10px;">
                กลุ่ม ${item.group} <br> วันที่เข้าร่วม: ${item.join_date}
            </p>
            <p><strong>รหัสนักศึกษา:</strong> ${item.student_id}</p>
            <p><strong>ชื่อ:</strong> ${item.first_name} ${item.last_name}</p>
            <p><strong>ภาควิชา:</strong> ${item.department}</p>
            <p><strong>ไซซ์เสื้อ:</strong> ${item.shirt_size}</p>
            <p><strong>จุดลงทะเบียนช่วงเช้า:</strong> ${item.checkin_morning}</p>
            <p><strong>จุดลงทะเบียนช่วงบ่าย:</strong> ${item.checkin_afternoon}</p>
            <br>
            <p><strong>*หมายเหตุ:</strong> ${item.note_th || '-'}</p>
            <p><strong></strong> ${item.note_en || ''}</p>
        </div>
    `).join('');

    container.innerHTML = resultsHtml;
}

// ทำให้ performSearch เป็นฟังก์ชัน global ที่ HTML เรียกใช้ได้
window.performSearch = performSearch;

// Add event listener for 'Enter' key on the input field
document.getElementById('query').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
    }
});

// --- 1. Fetch data when the page loads ---
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // ... (โค้ดดึงข้อมูล) ...
        const jsonData = await response.json();

        studentData = Object.values(jsonData).flat();

        // [เพิ่มโค้ด 2 บรรทัดนี้เข้าไป]
        console.log("Data loaded successfully. Total records:", studentData.length);
        console.log(studentData); // แสดงข้อมูลทั้งหมดที่ดึงมา

    } catch (error) {
        // ... (โค้ดจัดการ error) ...
    }
});