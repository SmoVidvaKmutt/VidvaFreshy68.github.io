
const firebaseConfig = {
  apiKey: "AIzaSyDsIOXsXLQYtIplfZxBJOfZMDERLZ1JV4k",
  authDomain: "smovidvafreshy68.firebaseapp.com",
  projectId: "smovidvafreshy68",
  storageBucket: "smovidvafreshy68.firebasestorage.app",
  messagingSenderId: "230035888212",
  appId: "1:230035888212:web:b403cac8fb2f98eb4bb5c1",
  measurementId: "G-D3KPBVTBQD"
};

 --- ไม่ต้องแก้ไขโค้ดด้านล่างนี้ ---

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const studentsCollection = collection(db, "students");

// --- Helper function to compute SHA-256 hash on the client ---
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log(hashHex);
    return hashHex;
}

// --- Search Function (Securely queries Firestore) ---
async function performSearch() {
    const rawQuery = document.getElementById('query').value.trim();
    if (!rawQuery) {
        alert("กรุณากรอกข้อมูลเพื่อค้นหา (รหัสนักศึกษา หรือเบอร์โทรศัพท์)");
        return;
    }

    const cleanQuery = rawQuery.replace(/\s/g, '');
    
    // Display loading message
    const container = document.getElementById('results-container');
    container.innerHTML = '<div class="result"><p>กำลังค้นหา...</p></div>';

    try {
        let results = [];

        // --- Path 1: Search by Student ID (Fastest and most direct) ---
        // Hash the input query to match the document ID in Firestore
        const hashedId = await sha256(cleanQuery);
        const docRef = doc(db, "students", hashedId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // If a document is found by ID, add its records to the results
            results.push(...docSnap.data().records);
        }

        // --- Path 2: Search by Phone Number ---
        // This requires a composite index in Firestore.
        // Firestore will provide a link to create it in the console if it's missing.
        const phoneWithZero = '0' + (cleanQuery.startsWith('0') ? cleanQuery.substring(1) : cleanQuery);
        const phoneWithoutZero = cleanQuery.startsWith('0') ? cleanQuery.substring(1) : cleanQuery;
        
        const phoneQuery = query(studentsCollection, where("records.phone", "array-contains-any", [phoneWithZero, phoneWithoutZero]));
        const phoneSnapshot = await getDocs(phoneQuery);
        
        phoneSnapshot.forEach(doc => {
            // Add records from documents found by phone number
            results.push(...doc.data().records);
        });

        // --- Final Step: Filter out duplicates and show results ---
        // This handles cases where a record might be found by both ID and phone
        const uniqueResults = Array.from(new Map(results.map(item => [item.student_id, item])).values());

        showResults(uniqueResults);

    } catch (error) {
        console.error("Error searching data: ", error);
        // Provide helpful feedback if the error is due to a missing index
        if (error.code === 'failed-precondition') {
            container.innerHTML = `<div class="result"><p>เกิดข้อผิดพลาด: จำเป็นต้องสร้าง Index ใน Firestore เพื่อให้ค้นหาด้วยเบอร์โทรศัพท์ได้</p><p style="font-size:14px; color:#ffdddd;">กรุณาเปิด Console (กด F12) และคลิกที่ลิงก์ในข้อความ Error เพื่อสร้าง Index โดยอัตโนมัติ หลังจากสร้างแล้ว กรุณารอสักครู่แล้วลองอีกครั้ง</p></div>`;
        } else {
            container.innerHTML = '<div class="result"><p>เกิดข้อผิดพลาดในการค้นหา</p></div>';
        }
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

// Make performSearch a global function that HTML can call
window.performSearch = performSearch;

// Add event listener for 'Enter' key on the input field
document.getElementById('query').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
    }
});
